import { useEffect, useId, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DialogButton from '../atoms/DialogButton';
import GlassOverlay from '../atoms/GlassOverlay';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import { useKeyboardOffset } from '../../hooks/useKeyboardOffset';
import { useOverlay } from '../../providers/OverlayProvider';
import { inset } from '../../utils/neumorphic';
import { createModalStyles } from './modalStyles';

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
});

type Props = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  saveTitle: (title: string) => void;
  title?: string;
  goBack: () => void;
  cancelButton?: boolean;
  modalTitle?: string;
};

const ModalTitle = ({
  visible,
  setVisible,
  saveTitle,
  title: reminderTitle = '',
  goBack,
  cancelButton = false,
  modalTitle = i18n.t('organizerTitle'),
}: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const keyboardOffset = useKeyboardOffset();
  const { showOverlay, hideOverlay } = useOverlay();
  const overlayId = useId();

  const [title, setTitle] = useState(reminderTitle);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setTitle(reminderTitle);
  }, [reminderTitle]);

  const saveChanges = () => {
    if (title) {
      saveTitle(title);
      setVisible(false);
    }
  };

  const onCancel = () => {
    setVisible(false);
    if (cancelButton || reminderTitle) {
      setTitle(reminderTitle);
      return;
    }
    goBack();
  };

  // Handlers always read the latest render, while the portal node can be
  // rebuilt only when something visible changes.
  const handlersRef = useRef({ saveChanges, onCancel });
  handlersRef.current = { saveChanges, onCancel };

  useEffect(() => {
    if (!visible) {
      hideOverlay(overlayId);
      return;
    }

    const modalStyles = createModalStyles(theme);

    showOverlay(
      overlayId,
      <GlassOverlay
        onDismiss={() => handlersRef.current.onCancel()}
        bottomOffset={keyboardOffset}
        accessibilityLabel={modalTitle}
      >
        <Text style={modalStyles.title}>{modalTitle}</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.textColor,
              backgroundColor: theme.surfaceColor,
              borderRadius: theme.borderRadiusSmall,
              borderWidth: 1,
              borderColor: focused ? theme.accentColor : 'transparent',
              outlineWidth: 0,
            },
            inset(theme, 'sm'),
          ]}
          onChangeText={setTitle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          value={title}
          placeholder={i18n.t('insertTitle')}
          maxLength={40}
          placeholderTextColor={theme.placeholderTextColor}
          onSubmitEditing={() => handlersRef.current.saveChanges()}
          returnKeyType="done"
          autoFocus
        />
        <View style={modalStyles.actions}>
          <DialogButton
            label={i18n.t('cancel')}
            onPress={() => handlersRef.current.onCancel()}
          />
          <DialogButton
            label={i18n.t('save')}
            onPress={() => handlersRef.current.saveChanges()}
            variant="primary"
            disabled={!title}
          />
        </View>
      </GlassOverlay>,
    );
  }, [
    visible,
    title,
    focused,
    reminderTitle,
    cancelButton,
    modalTitle,
    keyboardOffset,
    theme,
    showOverlay,
    hideOverlay,
    overlayId,
  ]);

  useEffect(() => () => hideOverlay(overlayId), [hideOverlay, overlayId]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handlersRef.current.onCancel();
      return true;
    });
    return () => subscription.remove();
  }, [visible]);

  return null;
};

export default ModalTitle;
