import {useState, useEffect} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Layout, ModalTitle, ItemList, ImageItemList, ModalImage, ModalAudio} from '../molecules';
import {IconButton} from '../atoms';
import AnimatedIconButton from '../atoms/AnimatedIconButton';
import {CREATE_REMINDER, SET_CURRENT_REMINDER, UPDATE_REMINDER} from '../../config/redux/actions';
import generateUUID from '../../utils/uuidUtil';
import {deleteAsync} from 'expo-file-system';

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
            position: reminder.items.length + 1,
        };
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items: [...reminder.items, newItem]}});
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
        setShowDeleteButton(true);
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
            <IconButton 
                name={showButtons ? 'minus' : 'plus'} 
                onPress={() => setShowButtons(!showButtons)} 
                containerStyle={{...styles.button, zIndex: 20}} 
            />
            <AnimatedIconButton 
                name="microphone" 
                onPress={onAudioButtonPress} 
                position={80} 
                showButton={showButtons}
                containerStyle={{zIndex: 9}}
            />
            <AnimatedIconButton 
                name="camera" 
                onPress={onCameraButtonPress} 
                position={140} 
                showButton={showButtons}
                containerStyle={{zIndex: 8}}
            />
            <AnimatedIconButton 
                name="pencil" 
                onPress={addItemText} 
                position={200} 
                showButton={showButtons}
                containerStyle={{zIndex: 7}}
            />
            <AnimatedIconButton 
                name="list-alt" 
                onPress={() => setChecksEnabled((previousChecksEnabled) => !previousChecksEnabled)} 
                position={260} 
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
            <ModalImage item={selectedImage} visible={showModalImage} setVisible={setShowModalImage} />
            <ModalAudio saveAudio={(audioUri) => createItem(audioUri, 'audio')} visible={showModalAudio} setVisible={setShowModalAudio} />
        </Layout>
    )
}

export default ReminderScreen;