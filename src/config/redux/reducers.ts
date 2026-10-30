import {
  CREATE_REMINDER,
  UPDATE_REMINDER,
  DELETE_REMINDER,
  SET_CURRENT_REMINDER,
  CHANGE_THEME,
  START_THEME_ANIMATION,
  SET_ORDERED_REMINDERS,
} from './actions';
import type { Reminder, RemindersState, ThemeState } from '../types';
import { darkTheme, ligthTheme } from '../theme';

const remindersInitialState: RemindersState = {
  reminders: [],
  currentReminder: null,
};

const themeInitialState: ThemeState = {
  theme: { ...darkTheme },
  isDarkTheme: true,
  startThemeAnimation: false,
};

type RemindersAction =
  | { type: typeof CREATE_REMINDER; payload: Reminder }
  | { type: typeof UPDATE_REMINDER; payload: Reminder }
  | { type: typeof DELETE_REMINDER; payload: Reminder }
  | { type: typeof SET_CURRENT_REMINDER; payload: Reminder | null }
  | { type: typeof SET_ORDERED_REMINDERS; payload: Reminder[] };

type ThemeAction =
  | { type: typeof CHANGE_THEME; payload: boolean }
  | { type: typeof START_THEME_ANIMATION; payload?: boolean };

/** Replaces a reminder keeping its position, ignoring ids that are not in the list. */
const replaceReminder = (reminders: Reminder[], reminder: Reminder): Reminder[] =>
  reminders.map(current => (current.id === reminder.id ? reminder : current));

const remindersReducer = (
  state = remindersInitialState,
  action: RemindersAction,
): RemindersState => {
  switch (action.type) {
    case CREATE_REMINDER: {
      const exists = state.reminders.some(r => r.id === action.payload.id);
      return {
        ...state,
        currentReminder: action.payload,
        reminders: exists
          ? replaceReminder(state.reminders, action.payload)
          : [action.payload, ...state.reminders],
      };
    }
    case UPDATE_REMINDER:
      return {
        ...state,
        currentReminder:
          state.currentReminder?.id === action.payload.id
            ? action.payload
            : state.currentReminder,
        reminders: replaceReminder(state.reminders, action.payload),
      };
    case DELETE_REMINDER:
      return {
        ...state,
        currentReminder:
          state.currentReminder?.id === action.payload.id ? null : state.currentReminder,
        reminders: state.reminders.filter(r => r.id !== action.payload.id),
      };
    case SET_CURRENT_REMINDER:
      if (!action.payload) {
        return { ...state, currentReminder: null };
      }
      return {
        ...state,
        currentReminder: action.payload,
        // Keep the list in sync while editing, but never insert untitled reminders.
        reminders: replaceReminder(state.reminders, action.payload),
      };
    case SET_ORDERED_REMINDERS:
      return { ...state, reminders: action.payload };
    default:
      return state;
  }
};

const themeReducer = (state = themeInitialState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case CHANGE_THEME:
      return {
        ...state,
        isDarkTheme: action.payload,
        theme: action.payload ? darkTheme : ligthTheme,
        startThemeAnimation: false,
      };
    case START_THEME_ANIMATION:
      return { ...state, startThemeAnimation: true };
    default:
      return state;
  }
};

export { remindersReducer, themeReducer };
