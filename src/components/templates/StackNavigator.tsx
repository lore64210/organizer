import { createStackNavigator } from '@react-navigation/stack';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { useAppSelector } from '../../config/redux/hooks';
import { CameraScreen, HomeScreen, ReminderScreen } from '../organisms';

export type RootStackParamList = {
  HomeScreen: undefined;
  ReminderScreen: undefined;
  CameraScreen: undefined;
};

const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const baseTheme = isDarkTheme ? DarkTheme : DefaultTheme;

  const navigationTheme: NavigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: theme.backgroundColor,
      card: theme.backgroundColor,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Navigator id="root" screenOptions={{ headerShown: false }} initialRouteName="HomeScreen">
        <Screen name="HomeScreen" component={HomeScreen} />
        <Screen name="ReminderScreen" component={ReminderScreen} />
        <Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{ animation: 'none', gestureEnabled: false }}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
