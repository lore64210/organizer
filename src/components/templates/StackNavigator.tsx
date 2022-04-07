import { createStackNavigator } from '@react-navigation/stack';
import { CameraScreen, HomeScreen, ReminderScreen } from '../organisms';
import { NavigationContainer } from '@react-navigation/native';
const {Navigator, Screen} = createStackNavigator();
import { useSelector } from 'react-redux';

const StackNavigator = () => {
  //@ts-ignore
  const {theme} = useSelector(({themeReducer}) => {
    return themeReducer;
  });

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