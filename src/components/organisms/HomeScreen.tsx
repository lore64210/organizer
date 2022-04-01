import {View, StyleSheet} from 'react-native';
import { useSelector, useDispatch, } from 'react-redux';
import { CREATE_REMINDER } from '../../config/redux/actions';
import {Header, HomeItem} from '../molecules';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#041C32',
        flex: 1
    }
})

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
        <View style={styles.container}>
            <Header title="Reminders" />

            {
                reminders.map(reminder => (
                    <HomeItem key={reminder.id} item={reminder} />
                ))
            }
        </View>
    )
}

export default HomeScreen;