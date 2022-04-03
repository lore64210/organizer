import {useState, useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Header} from '../molecules';
import {IconButton} from '../atoms';
import AnimatedIconButton from '../atoms/AnimatedIconButton';


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#041C32',
        flex: 1,
    },
    button: {
        position: 'absolute',
        bottom: 40,
    }
});

const ReminderScreen : React.FC<{navigation: any}> = ({navigation}) => {

    const showButtonsAnimation = useRef(new Animated.Value(0)).current;

    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        Animated.timing(showButtonsAnimation, {toValue: 1, duration: 1000, useNativeDriver: true}).start();
    }, [showButtons]);

    //@ts-ignore
    const reminder = useSelector(({remindersReducer: {currentReminder}}) => {
        return currentReminder;
    });

    const dispatch = useDispatch();

    const onPress = () => {
        navigation.navigate('CameraScreen')
    }
    
    return (
        <View style={styles.container}>
            <Header title={reminder.title} />
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

        </View>
    )
}

export default ReminderScreen;