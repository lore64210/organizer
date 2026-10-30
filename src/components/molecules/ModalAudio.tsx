import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import { IconButton } from '../atoms';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';
import { notify } from '../../utils/alerts';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    modalContentContainer: {
      backgroundColor: theme.secondaryColor,
      width: '90%',
      height: 220,
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: theme.borderRadius,
    },
    modalTitle: {
      fontSize: 18,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    audioButtonsContainer: {
      width: '60%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 10,
    },
    audioButton: {
      position: 'relative',
      width: 60,
      height: 60,
      left: 0,
      bottom: 0,
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
      bottom: 0,
    },
  });

type PreviewProps = {
  uri: string;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
};

const AudioPreview = ({ uri, theme, styles }: PreviewProps) => {
  const player = useAudioPlayer({ uri }, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <IconButton
      size={30}
      containerStyle={styles.audioButton}
      name={status.playing ? 'stop' : 'play'}
      onPress={toggle}
      color={theme.textColor}
      accessibilityLabel={i18n.t(status.playing ? 'pauseAudio' : 'playAudio')}
    />
  );
};

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  saveAudio: (uri: string) => void;
};

const ModalAudio = ({ visible, setVisible, saveAudio }: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const isRecordingRef = useRef(false);
  const isStartingRef = useRef(false);
  const pendingStopRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(
    () => () => {
      if (isRecordingRef.current) {
        recorder.stop().catch(() => {});
      }
    },
    [recorder],
  );

  const finishRecording = async () => {
    setIsRecording(false);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      setUri(recorder.uri);
    } catch (error) {
      console.warn('Failed to stop recording', error);
    }
  };

  const startRecording = async () => {
    pendingStopRef.current = false;
    isStartingRef.current = true;
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        notify(i18n.t('microphonePermission'));
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      // The user can release the button before the async setup finishes.
      if (pendingStopRef.current) {
        pendingStopRef.current = false;
        await finishRecording();
      }
    } catch (error) {
      console.warn('Failed to start recording', error);
      setIsRecording(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = async () => {
    if (isStartingRef.current) {
      pendingStopRef.current = true;
      return;
    }
    if (!isRecording) {
      return;
    }
    await finishRecording();
  };

  const onClose = async () => {
    if (isRecording) {
      await stopRecording();
    }
    setUri(null);
    setVisible(false);
  };

  const canSave = !isRecording && !!uri;

  const saveChanges = () => {
    if (canSave && uri) {
      saveAudio(uri);
      setUri(null);
      setVisible(false);
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>
            {isRecording ? i18n.t('releaseToStopRecording') : i18n.t('pressToStartRecording')}
          </Text>
          <View style={styles.audioButtonsContainer}>
            <IconButton
              size={30}
              containerStyle={styles.audioButton}
              name="microphone"
              onPressIn={startRecording}
              onPressOut={stopRecording}
              color={isRecording ? theme.deleteButtonColor : theme.textColor}
              accessibilityLabel={i18n.t('pressToStartRecording')}
            />
            {uri ? <AudioPreview uri={uri} theme={theme} styles={styles} /> : null}
          </View>
          <View style={styles.buttonsContainer}>
            <IconButton
              containerStyle={styles.button}
              name="close"
              onPress={onClose}
              accessibilityLabel={i18n.t('cancel')}
            />
            <IconButton
              containerStyle={styles.button}
              name="check"
              onPress={saveChanges}
              color={canSave ? theme.textColor : 'grey'}
              disabled={!canSave}
              accessibilityLabel={i18n.t('save')}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAudio;
