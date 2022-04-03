import {useState, useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Header, ModalTitle} from '../molecules';
import {IconButton} from '../atoms';
import { Layout } from '.';
import AnimatedIconButton from '../atoms/AnimatedIconButton';
import { SET_CURRENT_REMINDER } from '../../config/redux/actions';

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 40,
    }
});

const ReminderScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const showButtonsAnimation = useRef(new Animated.Value(0)).current;

     //@ts-ignore
     const reminder = useSelector(({remindersReducer: {currentReminder}}) => {
        return currentReminder;
    });

    const [showButtons, setShowButtons] = useState(false);
    const [modalVisible, setModalVisible] = useState(!reminder.title);

    useEffect(() => {
        Animated.timing(showButtonsAnimation, {toValue: 1, duration: 1000, useNativeDriver: true}).start();
    }, [showButtons]);

    const dispatch = useDispatch();

    const onPress = () => {
        navigation.navigate('CameraScreen')
    }

    const onTitlePress = () => {
        setModalVisible(true);
        setShowButtons(false);
    }

    return (
        <Layout headerProps={{title: reminder.title, onTitlePress: () => onTitlePress()}}>
            <IconButton name={showButtons ? 'minus' : 'plus'} onPress={() => setShowButtons(!showButtons)} style={{zIndex: 0}} />
            <AnimatedIconButton 
                name="microphone" 
                onPress={() => console.log('test')} 
                position={80} 
                showButton={showButtons}
                containerStyle={{zIndex: -1}}
            />
            <AnimatedIconButton 
                name="camera" 
                onPress={() => console.log('test')} 
                position={140} 
                showButton={showButtons}
                containerStyle={{zIndex: -2}}
            />
            <AnimatedIconButton 
                name="pencil" 
                onPress={() => console.log('test')} 
                position={200} 
                showButton={showButtons}
                containerStyle={{zIndex: -2}}
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