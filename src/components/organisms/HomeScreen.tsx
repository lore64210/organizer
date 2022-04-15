import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {DELETE_REMINDER, SET_CURRENT_REMINDER, SET_ORDERED_REMINDERS, UPDATE_REMINDER} from '../../config/redux/actions';
import {reminder} from '../../config/types';
import {AnimatedIconButton, IconButton} from '../atoms';
import {HomeItem, Layout} from '../molecules';
import uuid from '../../utils/uuidUtil';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { DraxProvider, DraxList } from 'react-native-drax';
import {deleteAsync} from 'expo-file-system';

const createStyles = (theme, window) => StyleSheet.create({
    button: {
        borderWidth: 2,
    },
    draxListContainer: {
        flex: 1,
    },
    deleteButton: {
        backgroundColor: theme.deleteButtonColor,
        right: 0,
        width: '100%',
        height: '100%',
    },
    deleteButtonContainer: {
        width: 50,
        height: 50,
        position: 'absolute',
        left: window.width / 2 - 25,
        bottom: 0,
    },
})

const emptyReminder: reminder = {
    id: '',
    title: '',
    items: [],
    imageItems: [],
    hide: false
};

const HomeScreen : React.FC<{navigation: any}> = ({navigation}) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const window = useWindowDimensions();
    const styles = createStyles(theme, window);

    //@ts-ignore
    const reminders = useSelector(({remindersReducer: {reminders}}) => {
        return reminders;
    });

    const dispatch = useDispatch();

    const [showDeleteButton, setShowDeleteButton] = useState(false);

    const onPress = reminder => {
        navigation.navigate('ReminderScreen')
        dispatch({type: SET_CURRENT_REMINDER, payload: reminder});    
    }

    const onItemDragEnd = (e) => {
        const {dragAbsolutePosition, item} = e;
        const {x: itemPositionX, y: itemPositionY} = dragAbsolutePosition;
        if (itemPositionY < window.height - 75 
            && itemPositionY > window.height - 175
            && itemPositionX < window.width / 2 + 75
            && itemPositionX > window.width / 2 - 25) {
                dispatch({type: UPDATE_REMINDER, payload: {...item, hide: true}});
                setTimeout(() => {
                    item.items.forEach(i => {
                        if (i.type === 'audio') {
                            deleteAsync(i.value, {idempotent: true})
                        }
                    });
                    item.imageItems.forEach(i => {
                        deleteAsync(i.value, {idempotent: true});
                    });
                    dispatch({type: DELETE_REMINDER, payload: item});
                }, 1500)
        }
        setShowDeleteButton(false);
    }

    return (
        <Layout headerProps={{title: 'Organizer'}}>
            <DraxProvider>
                <DraxList
                    style={styles.draxListContainer}
                    data={reminders}
                    onItemDragStart={() => setShowDeleteButton(true)}
                    onItemDragEnd={onItemDragEnd}
                    renderItemContent={({ item: reminder } : { item : reminder }) => (
                        <HomeItem key={reminder.id} item={reminder} onItemPress={() => onPress(reminder)} />
                    )}
                    onItemReorder={({ fromIndex, toIndex }) => {
                        const newData = [...reminders];
                        newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
                        dispatch({type: SET_ORDERED_REMINDERS, payload: newData})
                    }}
                    keyExtractor={(item : reminder) => item.id}
                />
                <View style={styles.deleteButtonContainer}>
                    <AnimatedIconButton 
                        name='trash' 
                        containerStyle={styles.deleteButton}
                        showButton={showDeleteButton}
                        position={20}
                        initialPosition={-100}
                        color={theme.backgroundColor}
                    />
                </View>
            </DraxProvider>
            <IconButton containerStyle={styles.button} name='plus' onPress={() => onPress({...emptyReminder, id: uuid(), position: reminders.length + 1})} />
        </Layout>
    )
}

export default HomeScreen;