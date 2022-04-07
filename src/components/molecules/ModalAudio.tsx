import { useState, useEffect } from 'react';
import { View, Modal, Text, StyleSheet } from 'react-native';
import { IconButton } from '../atoms';
import theme from '../../config/theme';
import { Audio } from 'expo-av';
import { Recording, Sound } from 'expo-av/build/Audio';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContentContainer: {
        backgroundColor: theme.secondaryColor,
        width: '90%',
        height: 200,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: theme.borderRadius,
    },
    modalTitle: {
        fontSize: 20,
        color: theme.textColor,
    },
    input: {
        color: 'white',
        backgroundColor: theme.primaryColor,
        width: '90%',
        padding: 10,
        borderRadius: theme.borderRadius,
        marginBottom: 30,
    },
    audioButtonsContainer: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
    },
    audioButton: {
        position: 'relative',
        width: 60,
        height: 60,
        left: 0,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        position: 'relative',
        width: 40,
        height: 40,
        left: 0,
    }
});

const ModalAudio = ({visible, setVisible, saveAudio}) => {

    const [isAudioRecording, setIsAudioRecording] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [recording, setRecording] = useState<Recording>();
    const [audioUri, setAudioUri] = useState('');
    const [sound, setSound] = useState<Sound>();

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync(); }
            : undefined;
    }, [sound]);

    useEffect(() => {
        const saveSound = async () => {
            const onPlaybackStatusUpdate = (playbackStatus) => {
                if (playbackStatus.didJustFinish) {
                    setIsAudioPlaying(false);
                }
            }
            const { sound } = await Audio.Sound.createAsync({uri: audioUri}, {}, onPlaybackStatusUpdate);
            setSound(sound);
        }
        audioUri && saveSound();
    }, [audioUri]);

    const canSave = !isAudioRecording && !isAudioPlaying && audioUri;

    const onClose = () => {
        setAudioUri(null);
        setVisible(false);
    }

    const saveChanges = () => {
        if (canSave) {
            saveAudio(audioUri);
            onClose();
        }
    }

    const startRecording = async () => {
        try {
            setIsAudioRecording(true);
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    const stopRecording = async () => {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setIsAudioRecording(false);
    }

    const onAudioButtonPressStart = () => {
        startRecording();
    }

    const onAudioButtonPressStop = () => {
        stopRecording();
    }

    const onPlayButtonPress = () => {
        audioUri && !isAudioRecording && (!isAudioPlaying ? playAudio() : stopAudio()) 
    }

    const playAudio = async () => {
        if (sound) {
            setIsAudioPlaying(true);
            await sound.playAsync(); 
        }
    }
    
    const stopAudio = async () => {
        if (sound) {
            setIsAudioPlaying(false);
            await sound.stopAsync(); 
        }
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContentContainer}>
                    <Text style={styles.modalTitle}>{!isAudioRecording ? 'Presione para ' : 'Suelte para dejar de '}grabar:</Text>
                    <View style={styles.audioButtonsContainer}>
                        <IconButton size={30} containerStyle={styles.audioButton} name='microphone' onPressIn={onAudioButtonPressStart} onPressOut={onAudioButtonPressStop} />
                        {audioUri 
                            ? <IconButton 
                                size={30} 
                                containerStyle={styles.audioButton} 
                                name={isAudioPlaying ? 'stop' : 'play'} 
                                onPress={onPlayButtonPress} 
                                color={!isAudioRecording ? theme.textColor : 'grey'} /> 
                            : null}
                    </View>
                    <View style={styles.buttonsContainer}>
                        <IconButton containerStyle={styles.button} name='close' onPress={onClose} />
                        <IconButton containerStyle={styles.button} name='check' onPress={saveChanges} color={canSave ? theme.textColor : 'grey'} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalAudio;