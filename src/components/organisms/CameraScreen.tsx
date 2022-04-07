import {useState, useEffect, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {Camera} from 'expo-camera';
import { IconButton } from '../atoms';
import Slider from '@react-native-community/slider';
import {useSelector, useDispatch} from 'react-redux';
import { SET_CURRENT_REMINDER } from '../../config/redux/actions';
import generateUUID from '../../utils/uuidUtil';

const createStyles = (theme) => StyleSheet.create({
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
    }
});

const CameraScreen = ({navigation}) => {
    //@ts-ignore
    const {theme} = useSelector(({themeReducer}) => {
        return themeReducer;
    });
    const styles = createStyles(theme);

    const [hasPermission, setHasPermission] = useState(null);
    const [zoom, setZoom] = useState(0);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);

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
                position: reminder.itemsImage.length + 1
            };
            dispatch({type: SET_CURRENT_REMINDER, payload: {...reminder, itemsImage: [newImage, ...reminder.itemsImage]}});
            navigation.goBack();
        }
      }
    return (
        <View style={styles.container}>
            <Camera ref={cameraRef} style={styles.camera} type={type} flashMode={flashMode} zoom={zoom}>
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