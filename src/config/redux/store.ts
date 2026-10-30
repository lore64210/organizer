import { combineReducers, createStore } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { remindersReducer, themeReducer } from './reducers';
import type { RootState } from '../types';

const persistConfig = {
  key: 'root',
  version: 2,
  storage: AsyncStorage,
  whitelist: ['remindersReducer', 'themeReducer'],
  // v1 kept both slices under the same key and stored lanes without the new theme fields.
  // Dropping the persisted theme lets the defaults (which include every theme key) apply.
  migrate: (state: any) => {
    if (!state) {
      return Promise.resolve({});
    }
    const { themeReducer, ...rest } = state;
    return Promise.resolve(rest);
  },
};

const rootReducer = combineReducers({
  remindersReducer,
  themeReducer,
});

const persistedReducer = persistReducer<RootState>(persistConfig as any, rootReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
