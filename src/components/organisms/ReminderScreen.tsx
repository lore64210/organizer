import {useState, useRef, useEffect} from 'react';
import {Animated, View, TextInput, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Layout, ModalTitle} from '../molecules';
import {IconButton} from '../atoms';
import AnimatedIconButton from '../atoms/AnimatedIconButton';
import {SET_CURRENT_REMINDER} from '../../config/redux/actions';
import generateUUID from '../../utils/uuidUtil';

const styles = StyleSheet.create({
    itemListContainer: {
        alignItems: 'center',
    },
    textItemContainer: {
        backgroundColor: "#064663",
        width: '90%',
        marginVertical: 20,
        borderRadius: 10,
    },
    textItem: {
        padding: 10,
    }
});

const ReminderScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const showButtonsAnimation = useRef(new Animated.Value(0)).current;
    const textItemsRef = useRef({});

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

    useEffect(() => {
        if (textItemsRef.current[actualItemTextId]) {
            textItemsRef.current[actualItemTextId].focus();
        }
    }, [actualItemTextId]);

    const dispatch = useDispatch();

    const onPress = () => {
        navigation.navigate('CameraScreen')
    }

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
            <View style={styles.itemListContainer}>
                {
                    reminder.itemsText.map((itemText) => (
                        <View key={itemText.id} style={styles.textItemContainer}>
                            <TextInput 
                                ref={input => textItemsRef.current[itemText.id] = input}
                                multiline
                                style={styles.textItem} 
                                onChangeText={(newText) => changeItemText(newText, itemText.id)} 
                                placeholderTextColor='#876b44'
                                placeholder='Nuevo reminder...'
                            />
                        </View>
                    ))
                }
            </View>
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
                onPress={() => console.log('test')} 
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