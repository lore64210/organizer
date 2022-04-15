import {useState, useRef, useEffect} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {Camera} from 'expo-camera';
import { IconButton, AnimatedIconButton } from '../atoms';
import Slider from '@react-native-community/slider';
import {useSelector, useDispatch} from 'react-redux';
import { SET_CURRENT_REMINDER } from '../../config/redux/actions';
import generateUUID from '../../utils/uuidUtil';

const createStyles = (theme, window) => StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        left: 0,
    },
    button: {
        position: 'relative',
        right: 0,
    },
    takePictureButton: {
        width: 70,
        height: 70
    },
    zoomBar: {
        left: '55%',
        bottom: '25%',
        position: 'absolute',
        transform: [{rotate: '-90deg'}],
        width: 200,
        height: 30,
    },
    codeButton: {
        zIndex: 0,
        left: window.width / 2 - 25,
        borderWidth: 0,
    },
});

const CameraScreen = ({navigation}) => {

    const window = useWindowDimensions();

    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme, window);

    const [hasPermission, setHasPermission] = useState(null);
    const [zoom, setZoom] = useState(0);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
    const [dataScanned, setDataScanned] = useState(null);
    const [dataScannedIcon, setDataScannedIcon] = useState('qrcode');

    const cameraRef = useRef(null);
    
    //@ts-ignore
    const reminder = useSelector(({remindersReducer: {currentReminder}}) => {
        return currentReminder;
    });

    const dispatch = useDispatch();
    
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
        return () => {}
    }, []);

    if (hasPermission === false) {
        navigation.goBack();
        return <View />;
    }

    const takePicture = async () => {
        if(cameraRef.current){
            const {uri} = await cameraRef.current.takePictureAsync(null);
            const newImage = {
                id: generateUUID(),
                value: uri,
                type: 'image',
                position: reminder.imageItems.length + 1,
                hidden: false,
            };
            dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, imageItems: [newImage, ...reminder.imageItems]}});
            navigation.goBack();
        }
    }
    
    const handleBarCodeScanned = ({ type, data }) => {
        setDataScannedIcon(type ==  256 ? 'qrcode' : 'barcode');
        setDataScanned(data);
    }

    const onCodeScannedButtonPress = () => {
        const newItem = {
            id: generateUUID(),
            value: dataScanned,
            type: 'text',
            position: reminder.items.length + 1,
            hidden: false,
        };
        dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, items: [...reminder.items, newItem]}});
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <Camera 
                onBarCodeScanned={handleBarCodeScanned}
                ref={cameraRef} 
                style={styles.camera} 
                type={type} 
                flashMode={flashMode} 
                zoom={zoom}
            >
                <View style={styles.container}>
                    <View style={styles.zoomBar}>
                        <Slider
                            style={{width: '100%', height: '100%'}}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor={theme.primaryColor}
                            maximumTrackTintColor={theme.backgroundColor}
                            thumbTintColor={theme.textColor}
                            onValueChange={setZoom}
                            value={zoom}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <IconButton 
                            containerStyle={styles.button} 
                            name='flash' 
                            onPress={() => {
                                setFlashMode(flashMode === Camera.Constants.FlashMode.on 
                                ? Camera.Constants.FlashMode.off
                                : Camera.Constants.FlashMode.on);
                            }}
                            color={flashMode === Camera.Constants.FlashMode.off ? theme.secondaryColor :  theme.textColor}
                        />
                        <AnimatedIconButton 
                            name={dataScannedIcon} 
                            onPress={onCodeScannedButtonPress} 
                            position={110} 
                            showButton={!!dataScanned}
                            containerStyle={styles.codeButton}
                        />
                        <IconButton 
                            size={50}
                            containerStyle={{...styles.button, ...styles.takePictureButton}} 
                            name='dot-circle-o' 
                            onPress={takePicture}
                        />
                        <IconButton 
                            containerStyle={styles.button} 
                            name='refresh' 
                            onPress={() => {
                                setType(
                                    type === Camera.Constants.Type.back
                                    ? Camera.Constants.Type.front
                                    : Camera.Constants.Type.back
                                );
                            }}
                        />
                    </View>
                </View>
            </Camera>
    </View>
    )
}

export default CameraScreen;