import { createStore, combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import remindersReducer from './reducers';
import { RootStateOrAny } from 'react-redux';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['reminders']
  }

const rootReducer = combineReducers({
    remindersReducer: persistReducer<RootStateOrAny>(persistConfig, remindersReducer)
  });

export const store = createStore(rootReducer);
export const persistor = persistStore(store);