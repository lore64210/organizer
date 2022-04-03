import {View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {SET_CURRENT_REMINDER} from '../../config/redux/actions';
import {reminder} from '../../config/types';
import {IconButton} from '../atoms';
import {Header, HomeItem} from '../molecules';
import uuid from '../../utils/uuidUtil';
import { Layout } from '.';

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
        <Layout headerProps={{title: 'Reminders'}}>
            {
                reminders.map(reminder => (
                    <HomeItem key={reminder.id} item={reminder} onItemPress={() => onPress(reminder)}/>
                ))
            }
            <IconButton name='plus' onPress={() => onPress({...emptyReminder, id: uuid()})} />
        </Layout>
    )
}

export default HomeScreen;