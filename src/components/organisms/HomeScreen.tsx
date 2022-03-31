import {View, Text, TouchableOpacity} from 'react-native';
import { useSelector, useDispatch, } from 'react-redux';
import { CREATE_REMINDER } from '../../config/redux/actions';

const HomeScreen : React.FC<{navigation: any}> = ({navigation}) => {

    //@ts-ignore
    const reminders = useSelector(({remindersReducer: {reminders}}) => {
        return reminders;
    });

    const dispatch = useDispatch();

    const onPress = () => {
        //navigation.navigate('ReminderScreen')
        dispatch({type: CREATE_REMINDER, payload: {id: 123, title: "asd"}});    
    }

    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPress}>
                <Text>Para ir al reminder</Text>
            </TouchableOpacity>
            
            <Text>{reminders?.length}</Text>
        </View>
    )
}

export default HomeScreen;