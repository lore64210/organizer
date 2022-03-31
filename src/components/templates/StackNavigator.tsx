import { createStackNavigator } from '@react-navigation/stack';
import { CameraScreen, HomeScreen, ReminderScreen } from '../organisms';
import { NavigationContainer } from '@react-navigation/native';
const {Navigator, Screen} = createStackNavigator();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Navigator initialRouteName="HomeScreen">
        <Screen name="HomeScreen" component={HomeScreen} />
        <Screen name="ReminderScreen" component={ReminderScreen} />
        <Screen name="CameraScreen" component={CameraScreen} />
      </Navigator>
    </NavigationContainer>
  );
}

export default StackNavigator;