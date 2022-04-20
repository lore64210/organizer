import StackNavigator from './src/components/templates/StackNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/config/redux/store';
import * as Notifications from "expo-notifications";
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { en, es } from './src/config/translations'
import AppLoading from 'expo-app-loading';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const App = () => {

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular, Montserrat_700Bold
  });

  i18n.translations = { en, es }

  i18n.locale = Localization.locale;
  i18n.fallbacks = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StackNavigator />
      </PersistGate>
    </Provider>
  );
}

export default App;