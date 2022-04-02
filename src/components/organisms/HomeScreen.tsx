import {View, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {SET_CURRENT_REMINDER} from '../../config/redux/actions';
import {reminder} from '../../config/types';
import {IconButton} from '../atoms';
import {Header, HomeItem} from '../molecules';
import uuid from '../../utils/uuidUtil';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#041C32',

        flex: 1
    }
});

const emptyReminder: reminder = {
    id: '',
    title: '',
    itemsText: [],
    itemsAudio: [],
    itemsImage: []
};

const HomeScreen : React.FC<{navigation: any}> = ({navigation}) => {

    //@ts-ignore
    const reminders = useSelector(({remindersReducer: {reminders}}) => {
        return reminders;
    });

    const dispatch = useDispatch();

    const onPress = reminder => {
        navigation.navigate('ReminderScreen')
        dispatch({type: SET_CURRENT_REMINDER, payload: reminder});    
    }

    return (
        <View style={styles.container}>
            <Header title="Reminders" />
            {
                reminders.map(reminder => (
                    <HomeItem key={reminder.id} item={reminder} onItemPress={() => onPress(reminder)}/>
                ))
            }
            <IconButton name="plus" onPress={() => onPress({...emptyReminder, id: uuid()})} />
        </View>
    )
}

export default HomeScreen;