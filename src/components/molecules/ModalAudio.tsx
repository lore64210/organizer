import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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
import DialogButton from '../atoms/DialogButton';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import { useDialog } from '../../providers/DialogProvider';
import type { Theme } from '../../config/types';
import { deleteFile } from '../../utils/files';
import { formatSeconds } from '../../utils/time';
import { createModalStyles } from './modalStyles';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    recorderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      marginTop: 10,
      marginBottom: 4,
    },
    micButton: {
      position: 'relative',
      left: 0,
      right: 'auto',
      bottom: 0,
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.secondaryColor,
    },
    recordingButton: {
      backgroundColor: theme.deleteButtonColor,
    },
    previewButton: {
      position: 'relative',
      left: 0,
      right: 'auto',
      bottom: 0,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.secondaryColor,
    },
  });

type PreviewProps = {
  uri: string;
  theme: Theme;
  containerStyle: StyleProp<ViewStyle>;
};

const AudioPreview = ({ uri, theme, containerStyle }: PreviewProps) => {
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
      size={24}
      containerStyle={containerStyle}
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
  const modalStyles = createModalStyles(theme);
  const styles = createStyles(theme);
  const dialog = useDialog();

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
        dialog.notify({ title: i18n.t('microphonePermission') });
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
      dialog.notify({ title: i18n.t('recordingError') });
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
        dialog.notify({ title: i18n.t('recordingTooShort') });
        setUri(null);
        return;
      }
      setUri(recordedUri);
    } catch (error) {
      console.warn('Failed to stop recording', error);
      dialog.notify({ title: i18n.t('recordingError') });
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
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Pressable style={modalStyles.card} onPress={() => {}}>
          <Text style={modalStyles.title}>{statusText}</Text>
          {hint ? <Text style={modalStyles.message}>{hint}</Text> : null}

          <View style={styles.recorderRow}>
            <IconButton
              size={28}
              containerStyle={[styles.micButton, isRecording && styles.recordingButton]}
              name={isRecording ? 'stop' : 'microphone'}
              onPress={onMicPress}
              disabled={isStarting}
              color={isRecording ? '#FFFFFF' : theme.textColor}
              accessibilityLabel={i18n.t(
                isRecording ? 'releaseToStopRecording' : 'pressToStartRecording',
              )}
            />
            {uri && !isRecording ? (
              <AudioPreview uri={uri} theme={theme} containerStyle={styles.previewButton} />
            ) : null}
          </View>

          <View style={modalStyles.actions}>
            <DialogButton label={i18n.t('cancel')} onPress={onClose} />
            <DialogButton
              label={i18n.t('save')}
              onPress={saveChanges}
              variant="primary"
              disabled={!canSave}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ModalAudio;
