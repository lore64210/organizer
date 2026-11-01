import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat/400Regular';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold';
import StackNavigator from './src/components/templates/StackNavigator';
import { DialogProvider } from './src/providers/DialogProvider';
import { store, persistor } from './src/config/redux/store';
import { useAppSelector } from './src/config/redux/hooks';
import { configureNotifications } from './src/services/notifications';
import './src/config/i18n';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotifications().catch(error => console.warn('Notifications setup failed', error));

const ThemedStatusBar = () => {
  const isDarkTheme = useAppSelector(state => state.themeReducer.isDarkTheme);
  return <StatusBar style={isDarkTheme ? 'light' : 'dark'} />;
};

const App = () => {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <DialogProvider>
              <ThemedStatusBar />
              <StackNavigator />
            </DialogProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
