import {useSelector, useDispatch} from 'react-redux';
import {SET_CURRENT_REMINDER, SET_ORDERED_REMINDERS} from '../../config/redux/actions';
import {reminder} from '../../config/types';
import {IconButton} from '../atoms';
import {HomeItem, Layout} from '../molecules';
import uuid from '../../utils/uuidUtil';
import { StyleSheet } from 'react-native';
import { DraxProvider, DraxList } from 'react-native-drax';

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
            <DraxProvider>
                <DraxList
                    data={reminders}
                    renderItemContent={({ item: reminder } : { item : reminder }) => (
                        <HomeItem key={reminder.id} item={reminder} onItemPress={() => onPress(reminder)} />
                    )}
                    onItemReorder={({ fromIndex, toIndex }) => {
                        const newData = [...reminders];
                        newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
                        console.log(newData);
                        dispatch({type: SET_ORDERED_REMINDERS, payload: newData})
                    }}
                    keyExtractor={(item : reminder) => item.id}
                />
            </DraxProvider>
            <IconButton containerStyle={styles.button} name='plus' onPress={() => onPress({...emptyReminder, id: uuid(), position: reminders.length + 1})} />
        </Layout>
    )
}

export default HomeScreen;