import StackNavigator from './src/components/templates/StackNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/config/redux/store';
import * as Notifications from "expo-notifications";
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import {en, es} from './src/config/translations'

const App = () => {

  i18n.translations = {en, es}
  
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StackNavigator />
      </PersistGate>
    </Provider>
  );
}

export default App;