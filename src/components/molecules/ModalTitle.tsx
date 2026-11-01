import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
import DialogButton from '../atoms/DialogButton';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import { useKeyboardOffset } from '../../hooks/useKeyboardOffset';
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
  const modalStyles = createModalStyles(theme);
  const keyboardOffset = useKeyboardOffset();

  const inputRef = useRef<TextInputInstance>(null);
  const [title, setTitle] = useState(reminderTitle);

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

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onShow={() => inputRef.current?.focus()}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={[modalStyles.backdrop, { paddingBottom: 24 + keyboardOffset }]}
        onPress={onCancel}
      >
        <Pressable style={modalStyles.card} onPress={() => {}}>
          <Text style={modalStyles.title}>{modalTitle}</Text>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                color: theme.textColor,
                backgroundColor: theme.secondaryColor,
                borderRadius: theme.borderRadiusSmall,
              },
            ]}
            onChangeText={setTitle}
            value={title}
            placeholder={i18n.t('insertTitle')}
            maxLength={40}
            placeholderTextColor={theme.placeholderTextColor}
            onSubmitEditing={saveChanges}
            returnKeyType="done"
          />
          <View style={modalStyles.actions}>
            <DialogButton label={i18n.t('cancel')} onPress={onCancel} />
            <DialogButton
              label={i18n.t('save')}
              onPress={saveChanges}
              variant="primary"
              disabled={!title}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ModalTitle;
