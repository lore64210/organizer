import { createStackNavigator } from '@react-navigation/stack';
import { CameraScreen, HomeScreen, ReminderScreen } from '../organisms';
import { NavigationContainer } from '@react-navigation/native';
import theme from '../../config/theme';
const {Navigator, Screen} = createStackNavigator();

const StackNavigator = () => {
  return (
    <>
      {/*@ts-ignore*/}
      <NavigationContainer theme={{colors: {background: theme.backgroundColor}}}>
          <Navigator screenOptions={{headerShown: false}} initialRouteName="HomeScreen">
            <Screen name="HomeScreen" component={HomeScreen} />
            <Screen name="ReminderScreen" component={ReminderScreen} />
            <Screen name="CameraScreen" component={CameraScreen} />
          </Navigator>
      </NavigationContainer>
    </>
  );
}

export default StackNavigator;