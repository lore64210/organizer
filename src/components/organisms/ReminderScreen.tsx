import {useState, useEffect} from 'react';
import {View, StyleSheet, useWindowDimensions, Keyboard} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Layout, ModalTitle, ItemList, ImageItemList, ModalImage, ModalAudio} from '../molecules';
import {IconButton} from '../atoms';
import AnimatedIconButton from '../atoms/AnimatedIconButton';
import {CREATE_REMINDER, SET_CURRENT_REMINDER, UPDATE_REMINDER} from '../../config/redux/actions';
import generateUUID from '../../utils/uuidUtil';
import {deleteAsync} from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import { cancelNotification, schedulePushNotification } from '../atoms/Notification';
import { NativeModules } from 'react-native'

const createStyles = (theme, isDarkTheme, window) => (StyleSheet.create({
    checkButtonPressed: {
        backgroundColor: isDarkTheme ? theme.textColor : theme.primaryColor,
    },
    button: {
        borderWidth: 2,
    },
    deleteButton: {
        backgroundColor: theme.deleteButtonColor,
        left: window.width / 2 - 25,
        right: 0,
        width: '100%',
        height: '100%',
    },
    deleteButtonContainer: {
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: 0,
    },
}));

const ReminderScreen : React.FC<{navigation: any}> = ({navigation}) => {
    //@ts-ignore
    const {theme, isDarkTheme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });

    const window = useWindowDimensions();
    const styles = createStyles(theme, isDarkTheme, window);

    const dispatch = useDispatch();

    //@ts-ignore
    const reminder = useSelector(({remindersReducer: {currentReminder}}) => {
        return currentReminder;
    });

    useEffect(() => {
        dispatch({type: UPDATE_REMINDER, payload: reminder});
    }, [reminder]);

    const [showButtons, setShowButtons] = useState(false);
    const [modalVisible, setModalVisible] = useState(!reminder.title);
    const [actualItemTextId, setActualItemTextId] = useState(null);
    const [showModalImage, setShowModalImage] = useState(false)
    const [showModalAudio, setShowModalAudio] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null);
    const [checksEnabled, setChecksEnabled] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [datePicked, setDatePicked] = useState(new Date());
    const [reminderTitle, setReminderTitle] = useState('');
    const [modalTitleReminderVisible, setModalTitleReminderVisible] = useState(false);
    const [currentAlarmSelected, setCurrentAlarmSelected] = useState('');

    const onCameraButtonPress = () => {
        setShowButtons(false);
        navigation.navigate('CameraScreen');
    }

    const onTitlePress = () => {
        setModalVisible(true);
        setShowButtons(false);
    }

    const addItemText = () => {
        const newItemText = createItem('', 'text');
        setShowButtons(false);
        setActualItemTextId(newItemText.id);
    }

    const createItem = (value, type) => {
        const newItem = {
            id: generateUUID(),
            value,
            type,
        };
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items: [newItem, ...reminder.items]}});
        return newItem;
    }

    const changeItemText = (newText, itemId) => {
        const items = reminder.items.map(item => item.id === itemId ? {...item, value: newText} : item);
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items}});
    }

    const changeItemCheck = (checked, itemId) => {
        const items = reminder.items.map(item => item.id === itemId ? {...item, checked} : item);
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items}});
    }

    const onImagePress = (item) => {
        setSelectedImage(item);
        setShowModalImage(true);
    }

    const onAudioButtonPress = () => {
        setShowModalAudio(true);
        setShowButtons(false);
    }

    const saveTitle = newTitle => {
        if (!reminder.title) {
            dispatch({type: CREATE_REMINDER, payload: reminder});
        }
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, title: newTitle}});
    }

    const orderItemList = (items) => {
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items}})
    }

    const orderImages = (imageItems) => {
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, imageItems}})
    }

    const onItemDragEnd = (e) => {
        const {item} = e;
        if (item.type === 'audio') {
            deleteAsync(item.value, {idempotent: true});
        } else if (item.type === 'alarm') {
            cancelNotification(item.value.notificationId);
        }
        dispatch({
            type: SET_CURRENT_REMINDER, 
            payload: {...reminder, items : reminder.items.filter(i => i.id !== item.id)}
        });
    }

    const onImageItemDragEnd = (e) => {
        const {item} = e;
        deleteAsync(item.value, {idempotent: true});
        dispatch({
            type: SET_CURRENT_REMINDER, 
            payload: {...reminder, imageItems : reminder.imageItems.filter(i => i.id !== item.id)}
        });
    }

    const onItemDragStart = () => {
        Keyboard.dismiss();
        setShowDeleteButton(true);
    }

    const openImagePicker = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted) {
            //@ts-ignore
            const {uri} = await ImagePicker.launchImageLibraryAsync();
            if (uri) {
                const newImage = {
                    id: generateUUID(),
                    value: uri,
                    type: 'image',
                };
                dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, imageItems: [newImage, ...reminder.imageItems]}});
            }
        }
    }

    const handleOnDatePick = (event, value) => {
        setShowDatePicker(false);
        if (event.type === 'set') {
            setDatePicked(value);
            setShowTimePicker(true);
        } else {
            setReminderTitle('');
            setCurrentAlarmSelected('');
        }
    }

    const handleOnTimePick = async (event, value) => {
        setShowTimePicker(false);
        if (event.type === 'set') {
            const time = value.toISOString();
            const date = datePicked.toISOString();
            const alarmDateWithoutOffset = new Date(date.split('T')[0] + 'T' + time.split('T')[1]);
            const alarmDate = new Date(alarmDateWithoutOffset.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
            const notificationId = await schedulePushNotification(reminderTitle, alarmDateWithoutOffset.setSeconds(0));
            const newItem = {
                id: currentAlarmSelected ? currentAlarmSelected : generateUUID(),
                type: 'alarm',
                value: {date: alarmDate.toISOString(), title: reminderTitle, notificationId},
            };
            if (currentAlarmSelected) {
                cancelNotification(reminder.items.filter(i => i.id === currentAlarmSelected)[0].value.notificationId); 
                dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items: reminder.items.map(i => i.id === currentAlarmSelected ? newItem : i)}})
            } else {
                dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items: [newItem, ...reminder.items]}})
            }
        }
        setReminderTitle('');
        setCurrentAlarmSelected('');
    }   

    const saveReminderTitle = (newReminderTitle) => {
        setReminderTitle(newReminderTitle);
        setModalTitleReminderVisible(false);
        setShowDatePicker(true);
    }

    useEffect(() => {
        if (currentAlarmSelected) {
            const currentAlarm = reminder.items.filter(i => i.id === currentAlarmSelected)[0];
            setReminderTitle(currentAlarm.value.title);
            setDatePicked(new Date(new Date(currentAlarm.value.date).getTime() + new Date().getTimezoneOffset() * 60 * 1000));
        } else {
            setReminderTitle('');
            setDatePicked(new Date());
        }
    }, [currentAlarmSelected]);

    const handleCancelReminderTitle = () => {
        setReminderTitle('');
        setModalTitleReminderVisible(false);
        setCurrentAlarmSelected('');
    }

    return (
        <Layout headerProps={{title: reminder.title, onTitlePress: () => onTitlePress()}}>
            <ImageItemList 
                onItemDragEnd={onImageItemDragEnd} 
                items={reminder.imageItems} 
                onPress={onImagePress} 
                orderImages={orderImages} 
            />
            <ItemList 
                actualItemTextId={actualItemTextId} 
                items={reminder.items} 
                changeItemText={changeItemText} 
                checksEnabled={checksEnabled}
                changeItemCheck={changeItemCheck}  
                orderItemList={orderItemList}
                onItemDragStart={onItemDragStart}
                onItemDragEnd={onItemDragEnd}
                reminderHasImages={!!reminder.imageItems.length}
                setShowDeleteButton={setShowDeleteButton}
                setCurrentAlarmSelected={setCurrentAlarmSelected}
                setModalTitleReminderVisible={setModalTitleReminderVisible}

            />
            <View style={styles.deleteButtonContainer}>
                <AnimatedIconButton 
                    name='trash' 
                    containerStyle={styles.deleteButton} 
                    showButton={showDeleteButton}
                    position={20}
                    initialPosition={-100}
                    color={theme.backgroundColor}
                    onPress={() => setShowDeleteButton(false)}
                />
            </View>
            <IconButton 
                name={showButtons ? 'minus' : 'plus'} 
                onPress={() => setShowButtons(!showButtons)} 
                containerStyle={{...styles.button, zIndex: 20}} 
            />
            <AnimatedIconButton 
                name="pencil" 
                onPress={addItemText} 
                position={80} 
                showButton={showButtons}
                containerStyle={{zIndex: 9}}
            />
            <AnimatedIconButton 
                name="microphone" 
                onPress={onAudioButtonPress} 
                position={140} 
                showButton={showButtons}
                containerStyle={{zIndex: 8}}
            />
            <AnimatedIconButton 
                name="camera" 
                onPress={onCameraButtonPress} 
                position={200} 
                showButton={showButtons}
                containerStyle={{zIndex: 7}}
            />
            <AnimatedIconButton 
                name="image" 
                onPress={openImagePicker} 
                position={260} 
                showButton={showButtons}
                containerStyle={{zIndex: 6}}
            />
            <AnimatedIconButton 
                name="calendar" 
                onPress={() => setModalTitleReminderVisible(true)} 
                position={320} 
                showButton={showButtons}
                containerStyle={{zIndex: 5}}
            />
            <AnimatedIconButton 
                name="list-alt" 
                onPress={() => setChecksEnabled((previousChecksEnabled) => !previousChecksEnabled)} 
                position={380} 
                showButton={showButtons}
                color={checksEnabled ? (isDarkTheme ? theme.primaryColor : theme.secondaryColor) : theme.textColor}
                containerStyle={{zIndex: 6, ...(checksEnabled ? styles.checkButtonPressed : {})}}
            />
            <ModalTitle
                visible={modalVisible}
                setVisible={setModalVisible}
                saveTitle={saveTitle}
                title={reminder.title}
                goBack={() => navigation.goBack()}
            />
            <ModalTitle
                visible={modalTitleReminderVisible}
                setVisible={setModalTitleReminderVisible}
                saveTitle={saveReminderTitle}
                title={reminderTitle}
                cancelButton
                goBack={() => handleCancelReminderTitle()}
            />
            <ModalImage item={selectedImage} visible={showModalImage} setVisible={setShowModalImage} />
            <ModalAudio saveAudio={(audioUri) => createItem(audioUri, 'audio')} visible={showModalAudio} setVisible={setShowModalAudio} />
            {
                showDatePicker && 
                    <RNDateTimePicker 
                        onChange={handleOnDatePick} 
                        mode="date" 
                        display='calendar' 
                        value={datePicked} 
                    />
            }
            {
                showTimePicker && 
                    <RNDateTimePicker 
                        onChange={handleOnTimePick} 
                        mode="time" 
                        display='clock' 
                        value={datePicked} 
                    />
            }

        </Layout>
    )
}

export default ReminderScreen;