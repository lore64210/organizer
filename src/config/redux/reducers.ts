import {
    FIND_ALL_REMINDERS,
    SAVE_REMINDER,
    UPDATE_REMINDER,
    DELETE_REMINDER,
    SET_CURRENT_REMINDER,
    GET_CURRENT_REMINDER,
} from './actions';
import {aviso} from '../types';

const initialState : {reminders: aviso[], currentReminder: aviso|null} = {
  reminders: [],
  currentReminder: null,
};

function remindersReducer(state = initialState, action: {type: string, payload: aviso|aviso[]}) {
  const {payload, type} = action;
  const {reminders, currentReminder} = state;
  switch (type) {
    case FIND_ALL_REMINDERS:
      return state.reminders;
    case SAVE_REMINDER:
      if (!Array.isArray(payload))
        state = {...state, reminders: [...reminders, payload]};
      break;
    case UPDATE_REMINDER:
      if (!Array.isArray(payload))
        state = {...state, reminders: reminders.map(r => r.id === payload.id ? payload : r)};
      break;
    case DELETE_REMINDER:
      if (!Array.isArray(payload))
        state = {...state, reminders: reminders.filter(r => r.id !== payload.id)};
      break;
    case SET_CURRENT_REMINDER:
      if (!Array.isArray(payload))
        state = {...state, currentReminder: payload};
      break;
    case GET_CURRENT_REMINDER:
      return currentReminder;
    default:
      return state;
  }
}

export default remindersReducer;