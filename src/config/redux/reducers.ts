import {
    CREATE_REMINDER,
    UPDATE_REMINDER,
    DELETE_REMINDER,
    SET_CURRENT_REMINDER,
    CHANGE_THEME,
} from './actions';
import {reminder, theme as themeType} from '../types';
import { darkTheme, ligthTheme } from '../theme';

const initialState : {reminders: reminder[], currentReminder: reminder|null, theme: themeType, isDarkTheme: boolean} = {
  reminders: [
    {
      id: '1',
      title: 'Titulo 1',
      items: [],
      itemsImage: []
    },
    {
      id: '2',
      title: 'Titulo 2',
      items: [],
      itemsImage: []
    },
    {
      id: '3',
      title: 'Titulo 3',
      items: [],
      itemsImage: []
    },
  ],
  currentReminder: null,
  theme: {...darkTheme},
  isDarkTheme: true,
};

function remindersReducer(state = initialState, action: {type: string, payload: reminder}) {
  const {payload, type} = action;
  const {reminders} = state;
  switch (type) {
    case CREATE_REMINDER:
        return {...state, reminders: (!reminders ? [payload] : [...reminders, payload])};
    case UPDATE_REMINDER:
        return {...state, reminders: reminders.map(r => r.id === payload.id ? payload : r)};
    case DELETE_REMINDER:
        return {...state, reminders: reminders.filter(r => r.id !== payload.id)};
    case SET_CURRENT_REMINDER:
        return {...state, currentReminder: payload};
    default:
      return {...state};
  }
}

function themeReducer(state = initialState, action: {type: string, payload: boolean}) {
  const {payload, type} = action;
  switch(type) {
    case CHANGE_THEME:
      return {...state, isDarkTheme: payload, theme: payload ? darkTheme : ligthTheme};
    default: 
      return {...state};
  }
}


export {
  remindersReducer,
  themeReducer,
};