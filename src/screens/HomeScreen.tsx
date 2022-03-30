import {View, Text, TouchableOpacity} from 'react-native';

const HomeScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const onPress = () => {
        navigation.navigate('ReminderScreen')
    }

    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
        </View>
    )
}

export default HomeScreen;