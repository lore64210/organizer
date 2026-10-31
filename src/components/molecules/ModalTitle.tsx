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
import { IconButton } from '../atoms';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';

const createStyles = (theme: Theme, isDarkTheme: boolean) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    modalContentContainer: {
      backgroundColor: isDarkTheme ? theme.secondaryColor : theme.primaryColor,
      width: '90%',
      height: 200,
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: theme.borderRadiusLarge,
      borderCurve: 'continuous',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 28,
      elevation: 16,
    },
    modalTitle: {
      fontSize: 20,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
    },
    input: {
      color: theme.textColor,
      backgroundColor: isDarkTheme ? theme.primaryColor : theme.secondaryColor,
      width: '90%',
      padding: 10,
      borderRadius: theme.borderRadiusSmall,
      marginBottom: 30,
      fontFamily: 'Montserrat_400Regular',
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
      backgroundColor: isDarkTheme ? theme.primaryColor : theme.secondaryColor,
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
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const styles = createStyles(theme, isDarkTheme);

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

  const onGoBack = () => {
    setVisible(false);
    goBack();
  };

  const onClose = () => {
    setTitle(reminderTitle);
    setVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onShow={() => inputRef.current?.focus()}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalContainer} onPress={() => {}}>
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            onChangeText={setTitle}
            value={title}
            placeholder={i18n.t('insertTitle')}
            maxLength={40}
            placeholderTextColor={theme.placeholderTextColor}
            onSubmitEditing={saveChanges}
            returnKeyType="done"
          />
          <View style={styles.buttonsContainer}>
            {cancelButton || reminderTitle ? (
              <IconButton
                containerStyle={styles.button}
                name="close"
                onPress={onClose}
                accessibilityLabel={i18n.t('cancel')}
              />
            ) : (
              <IconButton
                containerStyle={styles.button}
                name="arrow-left"
                onPress={onGoBack}
                accessibilityLabel={i18n.t('cancel')}
              />
            )}
            <IconButton
              containerStyle={styles.button}
              name="check"
              onPress={saveChanges}
              color={title ? theme.textColor : 'grey'}
              disabled={!title}
              accessibilityLabel={i18n.t('save')}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ModalTitle;
