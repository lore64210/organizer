import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { IconButton } from '../atoms';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';
import { notify } from '../../utils/alerts';
import { deleteFile } from '../../utils/files';
import { formatSeconds } from '../../utils/time';

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
      height: 240,
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
    timer: {
      fontSize: 13,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      opacity: 0.75,
    },    audioButtonsContainer: {
      width: '60%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 6,
    },
    audioButton: {
      position: 'relative',
      width: 60,
      height: 60,
      left: 0,
      bottom: 0,
    },
    recordingButton: {
      backgroundColor: theme.deleteButtonColor,
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
  const recorderState = useAudioRecorderState(recorder, 200);
  const isRecording = recorderState.isRecording;

  const [uri, setUri] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(
    () => () => {
      if (recorder.isRecording) {
        recorder.stop().catch(() => {});
      }
    },
    [recorder],
  );

  const startRecording = async () => {
    if (isStarting || recorder.isRecording) {
      return;
    }
    setIsStarting(true);
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
      if (uri) {
        deleteFile(uri);
        setUri(null);
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      setUri(null);
    } catch (error) {
      console.warn('Failed to start recording', error);
      notify(i18n.t('recordingError'));
    } finally {
      setIsStarting(false);
    }
  };

  const stopRecording = async () => {
    if (!recorder.isRecording) {
      return;
    }
    const duration = recorder.currentTime;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const recordedUri = recorder.uri;
      if (!recordedUri) {
        setUri(null);
        return;
      }
      if (duration < 0.4) {
        deleteFile(recordedUri);
        notify(i18n.t('recordingTooShort'));
        setUri(null);
        return;
      }
      setUri(recordedUri);
    } catch (error) {
      console.warn('Failed to stop recording', error);
      notify(i18n.t('recordingError'));
    }
  };

  const onMicPress = () => {
    if (recorder.isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  const resetRecording = async () => {
    if (recorder.isRecording) {
      try {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        deleteFile(recorder.uri);
      } catch (error) {
        console.warn('Failed to cancel recording', error);
      }
    }
    setUri(null);
  };

  const onClose = async () => {
    await resetRecording();
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

  const statusText = isRecording
    ? `${i18n.t('recording')} ${formatSeconds(recorderState.durationMillis / 1000)}`
    : uri
      ? i18n.t('recordingReady')
      : i18n.t('pressToStartRecording');

  const hint = isRecording
    ? i18n.t('releaseToStopRecording')
    : uri
      ? i18n.t('pressToStartRecording')
      : null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>{statusText}</Text>
          {hint ? <Text style={styles.timer}>{hint}</Text> : null}
          <View style={styles.audioButtonsContainer}>
            <IconButton
              size={30}
              containerStyle={[styles.audioButton, isRecording && styles.recordingButton]}
              name={isRecording ? 'stop' : 'microphone'}
              onPress={onMicPress}
              disabled={isStarting}
              color={theme.textColor}
              accessibilityLabel={i18n.t(
                isRecording ? 'releaseToStopRecording' : 'pressToStartRecording',
              )}
            />
            {uri && !isRecording ? (
              <AudioPreview uri={uri} theme={theme} styles={styles} />
            ) : null}
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
