import {useState, useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Layout, ModalTitle, TextItemsList} from '../molecules';
import {IconButton} from '../atoms';
import AnimatedIconButton from '../atoms/AnimatedIconButton';
import {SET_CURRENT_REMINDER} from '../../config/redux/actions';
import generateUUID from '../../utils/uuidUtil';

const ReminderScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const showButtonsAnimation = useRef(new Animated.Value(0)).current;

    //@ts-ignore
    const reminder = useSelector(({remindersReducer: {currentReminder}}) => {
        return currentReminder;
    });

    const [showButtons, setShowButtons] = useState(false);
    const [modalVisible, setModalVisible] = useState(!reminder.title);
    const [actualItemTextId, setActualItemTextId] = useState(null);

    useEffect(() => {
        Animated.timing(showButtonsAnimation, {toValue: 1, duration: 1000, useNativeDriver: true}).start();
    }, [showButtons]);

    const dispatch = useDispatch();

    const onCameraButtonPress = () => {
        navigation.navigate('CameraScreen')
    }

    console.log(reminder);

    const onTitlePress = () => {
        setModalVisible(true);
        setShowButtons(false);
    }

    const addItemText = () => {
        const newItemText = {
            id: generateUUID(),
            value: '',
            type: 'text',
            position: reminder.itemsText.length + 1,
        };
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, itemsText: [...reminder.itemsText, newItemText]}});
        setShowButtons(false);
        setActualItemTextId(newItemText.id);
    }

    const changeItemText = (newText, itemId) => {
        const itemsText = reminder.itemsText.map(item => item.id === itemId ? {...item, value: newText} : item);
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, itemsText}});
    }

    return (
        <Layout headerProps={{title: reminder.title, onTitlePress: () => onTitlePress()}}>
            <TextItemsList actualItemTextId={actualItemTextId} items={reminder.itemsText} changeItemText={changeItemText} />
            <IconButton name={showButtons ? 'minus' : 'plus'} onPress={() => setShowButtons(!showButtons)} containerStyle={{zIndex: 20}} />
            <AnimatedIconButton 
                name="microphone" 
                onPress={() => console.log('test')} 
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
            <ModalTitle
                visible={modalVisible}
                setVisible={setModalVisible}
                saveTitle={newTitle => dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, title: newTitle}})}
                title={reminder.title}
                goBack={() => navigation.goBack()}
            />
        </Layout>
    )
}

export default ReminderScreen;