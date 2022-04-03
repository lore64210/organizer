import {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Camera} from 'expo-camera';
import { IconButton } from '../atoms';

const styles = StyleSheet.create({
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
        right: 0
    },
    takePictureButton: {
        width: 70,
        height: 70
    }
});

const CameraScreen = ({navigation}) => {

    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);

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
    return (
        <View style={styles.container}>
            <Camera style={styles.camera} type={type} flashMode={flashMode}>
                <View style={styles.buttonContainer}>
                    <IconButton 
                        containerStyle={styles.button} 
                        name='flash' 
                        onPress={() => {
                            setFlashMode(flashMode === Camera.Constants.FlashMode.on 
                            ? Camera.Constants.FlashMode.off
                            : Camera.Constants.FlashMode.on);
                        }}
                        color={flashMode === Camera.Constants.FlashMode.off ? 'black' :  "#ECB365"}
                    />
                    <IconButton 
                        size={50}
                        containerStyle={{...styles.button, ...styles.takePictureButton}} 
                        name='dot-circle-o' 
                        onPress={() => {}}/>
                    <IconButton 
                        containerStyle={styles.button} 
                        name='refresh' 
                        onPress={() => {
                        setType(
                            type === Camera.Constants.Type.back
                            ? Camera.Constants.Type.front
                            : Camera.Constants.Type.back
                        );
                    }}/>
                </View>
            </Camera>
    </View>
    )
}

export default CameraScreen;