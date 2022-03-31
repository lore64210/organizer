import {View, Text, TouchableOpacity} from 'react-native';

const ReminderScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const onPress = () => {
        navigation.navigate('CameraScreen')
    }
    
    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir a la camara</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ReminderScreen;