import {useSelector, useDispatch} from 'react-redux';
import {SET_CURRENT_REMINDER} from '../../config/redux/actions';
import {reminder} from '../../config/types';
import {IconButton} from '../atoms';
import {HomeItem, Layout} from '../molecules';
import uuid from '../../utils/uuidUtil';
import { ScrollView, StyleSheet } from 'react-native';

const createStyles = (theme) => StyleSheet.create({
    button: {
        borderWidth: 2,
    }
})

const emptyReminder: reminder = {
    id: '',
    title: '',
    items: [],
    itemsImage: []
};

const HomeScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const styles = createStyles({});

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
            <ScrollView>
                {
                    reminders.map(reminder => (
                        <HomeItem key={reminder.id} item={reminder} onItemPress={() => onPress(reminder)}/>
                    ))
                }
            </ScrollView>
            <IconButton containerStyle={styles.button} name='plus' onPress={() => onPress({...emptyReminder, id: uuid()})} />
        </Layout>
    )
}

export default HomeScreen;