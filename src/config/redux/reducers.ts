import {
    FIND_ALL_REMINDERS,
    CREATE_REMINDER,
    UPDATE_REMINDER,
    DELETE_REMINDER,
    SET_CURRENT_REMINDER,
    GET_CURRENT_REMINDER,
} from './actions';
import {reminder} from '../types';

const initialState : {reminders: reminder[], currentReminder: reminder|null} = {
  reminders: [
    {
      id: '1',
      title: 'Titulo 1',
      itemsText: [],
      itemsAudio: [],
      itemsImage: []
    },
    {
      id: '2',
      title: 'Titulo 2',
      itemsText: [],
      itemsAudio: [],
      itemsImage: []
    },
    {
      id: '3',
      title: 'Titulo 3',
      itemsText: [],
      itemsAudio: [],
      itemsImage: []
    },
  ],
  currentReminder: null,
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

export default remindersReducer;