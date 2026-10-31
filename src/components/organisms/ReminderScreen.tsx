import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import i18n from '../../config/i18n';
import { useAppDispatch, useAppSelector } from '../../config/redux/hooks';
import {
  CREATE_REMINDER,
  SET_CURRENT_REMINDER,
} from '../../config/redux/actions';
import { isAlarmValue, type Item, type Theme } from '../../config/types';
import { AnimatedIconButton, IconButton } from '../atoms';
import {
  ImageItemList,
  ItemList,
  Layout,
  ModalAudio,
  ModalImage,
  ModalTitle,
} from '../molecules';
import { cancelAlarm, scheduleAlarm } from '../../services/notifications';
import { notify } from '../../utils/alerts';
import { toAlarmDate } from '../../utils/date';
import { deleteFile } from '../../utils/files';
import generateUUID from '../../utils/uuidUtil';

const createStyles = (theme: Theme, isDarkTheme: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    checkButtonPressed: {
      backgroundColor: isDarkTheme ? theme.textColor : theme.primaryColor,
    },
    button: {
      borderWidth: 2,
    },
    emptyListContainer: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyListText: {
      color: isDarkTheme ? theme.textColor : theme.primaryColor,
      fontFamily: 'Montserrat_400Regular',
    },
  });

const ReminderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const reminder = useAppSelector(state => state.remindersReducer.currentReminder);
  const styles = createStyles(theme, isDarkTheme);

  const [showButtons, setShowButtons] = useState(false);
  const [titleModalVisible, setTitleModalVisible] = useState(!reminder?.title);
  const [actualItemTextId, setActualItemTextId] = useState<string | null>(null);
  const [showModalImage, setShowModalImage] = useState(false);
  const [showModalAudio, setShowModalAudio] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Item | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePicked, setDatePicked] = useState(new Date());
  const [alarmTitle, setAlarmTitle] = useState('');
  const [alarmTitleModalVisible, setAlarmTitleModalVisible] = useState(false);
  const [currentAlarmSelected, setCurrentAlarmSelected] = useState('');

  // New reminders start with one empty item: focus it once the title is saved.
  const initialFocusPending = useRef(!reminder?.title);

  useEffect(() => {
    if (!initialFocusPending.current || titleModalVisible) {
      return;
    }
    initialFocusPending.current = false;

    const firstItem = reminder?.items[0];
    if (!firstItem || firstItem.type !== 'text') {
      return;
    }

    const timer = setTimeout(() => setActualItemTextId(firstItem.id), 200);
    return () => clearTimeout(timer);
  }, [titleModalVisible, reminder]);

  useEffect(() => {
    if (!currentAlarmSelected) {
      setAlarmTitle('');
      setDatePicked(new Date());
      return;
    }
    const alarm = reminder?.items.find(item => item.id === currentAlarmSelected);
    if (alarm && isAlarmValue(alarm.value)) {
      setAlarmTitle(alarm.value.title);
      setDatePicked(new Date(alarm.value.date));
    }
  }, [currentAlarmSelected]);

  if (!reminder) {
    return (
      <Layout headerProps={{ title: '' }}>
        <View style={styles.emptyListContainer} />
      </Layout>
    );
  }

  const updateItems = (items: Item[]) => {
    dispatch({ type: SET_CURRENT_REMINDER, payload: { ...reminder, items } });
  };

  const updateImages = (imageItems: Item[]) => {
    dispatch({ type: SET_CURRENT_REMINDER, payload: { ...reminder, imageItems } });
  };

  const resetAlarmDraft = () => {
    setAlarmTitle('');
    setCurrentAlarmSelected('');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const onShowButtonsPress = () => {
    setShowButtons(!showButtons);
    setActualItemTextId(null);
  };

  const addItemText = () => {
    const newItem: Item = {
      id: generateUUID(),
      value: '',
      type: 'text',
      checked: false,
    };
    updateItems([newItem, ...reminder.items]);
    setActualItemTextId(newItem.id);
    setShowButtons(false);
  };

  const addAudioItem = (uri: string) => {
    const newItem: Item = {
      id: generateUUID(),
      value: uri,
      type: 'audio',
    };
    updateItems([newItem, ...reminder.items]);
  };

  const changeItemText = (value: string, itemId: string) => {
    updateItems(
      reminder.items.map(item => (item.id === itemId ? { ...item, value } : item)),
    );
  };

  const changeItemCheck = (checked: boolean, itemId: string) => {
    updateItems(
      reminder.items.map(item => (item.id === itemId ? { ...item, checked } : item)),
    );
  };

  const deleteItem = (item: Item) => {
    if (item.type === 'audio' && typeof item.value === 'string') {
      deleteFile(item.value);
    }
    if (isAlarmValue(item.value)) {
      cancelAlarm(item.value.notificationId);
    }
    if (currentAlarmSelected === item.id) {
      resetAlarmDraft();
    }
    updateItems(reminder.items.filter(current => current.id !== item.id));
  };

  const deleteImage = (item: Item) => {
    if (typeof item.value === 'string') {
      deleteFile(item.value);
    }
    updateImages(reminder.imageItems.filter(current => current.id !== item.id));
  };

  const onImagePress = (item: Item) => {
    setSelectedImage(item);
    setShowModalImage(true);
  };

  const openGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      notify(i18n.t('photosPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const newImage: Item = {
      id: generateUUID(),
      value: result.assets[0].uri,
      type: 'image',
    };
    updateImages([newImage, ...reminder.imageItems]);
  };

  const onGalleryButtonPress = () => {
    setShowButtons(false);
    openGallery();
  };

  const onCameraButtonPress = () => {
    setShowButtons(false);
    navigation.navigate('CameraScreen');
  };

  const onAudioButtonPress = () => {
    setShowButtons(false);
    setShowModalAudio(true);
  };

  const onCalendarButtonPress = () => {
    setShowButtons(false);
    resetAlarmDraft();
    setAlarmTitleModalVisible(true);
  };

  const saveAlarmTitle = (newTitle: string) => {
    setAlarmTitle(newTitle);
    setAlarmTitleModalVisible(false);
    setShowDatePicker(true);
  };

  const handleOnDatePick = (event: DateTimePickerEvent, value?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && value) {
      setDatePicked(value);
      setShowTimePicker(true);
    } else {
      resetAlarmDraft();
    }
  };

  const handleOnTimePick = async (event: DateTimePickerEvent, value?: Date) => {
    setShowTimePicker(false);
    if (event.type !== 'set' || !value) {
      resetAlarmDraft();
      return;
    }

    const alarmDate = toAlarmDate(datePicked, value);
    if (alarmDate.getTime() <= Date.now()) {
      notify(i18n.t('dateInPast'));
      resetAlarmDraft();
      return;
    }

    const notificationId = await scheduleAlarm(alarmTitle, alarmDate);
    if (!notificationId) {
      notify(i18n.t('notificationsDisabled'));
      resetAlarmDraft();
      return;
    }

    if (currentAlarmSelected) {
      const previous = reminder.items.find(item => item.id === currentAlarmSelected);
      if (previous && isAlarmValue(previous.value)) {
        await cancelAlarm(previous.value.notificationId);
      }
    }

    const newItem: Item = {
      id: currentAlarmSelected || generateUUID(),
      type: 'alarm',
      value: {
        date: alarmDate.toISOString(),
        title: alarmTitle,
        notificationId,
      },
    };

    updateItems(
      currentAlarmSelected
        ? reminder.items.map(item => (item.id === newItem.id ? newItem : item))
        : [newItem, ...reminder.items],
    );
    resetAlarmDraft();
  };

  const onAlarmPress = (itemId: string) => {
    setShowButtons(false);
    setCurrentAlarmSelected(itemId);
    setAlarmTitleModalVisible(true);
  };

  const saveTitle = (newTitle: string) => {
    if (!reminder.title) {
      dispatch({ type: CREATE_REMINDER, payload: { ...reminder, title: newTitle } });
      return;
    }
    dispatch({
      type: SET_CURRENT_REMINDER,
      payload: { ...reminder, title: newTitle },
    });
  };

  const setChecksEnabled = (checksEnabled: boolean) => {
    dispatch({
      type: SET_CURRENT_REMINDER,
      payload: { ...reminder, checksEnabled },
    });
  };

  const hasContent = reminder.imageItems.length > 0 || reminder.items.length > 0;

  return (
    <Layout
      headerProps={{
        title: reminder.title,
        onTitlePress: () => setTitleModalVisible(true),
      }}
    >
      {hasContent ? (
        <View style={styles.container}>
          <ImageItemList
            items={reminder.imageItems}
            onPress={onImagePress}
            onDelete={deleteImage}
            onReorder={updateImages}
          />
          <ItemList
            items={reminder.items}
            actualItemTextId={actualItemTextId}
            changeItemText={changeItemText}
            checksEnabled={reminder.checksEnabled}
            changeItemCheck={changeItemCheck}
            onReorder={updateItems}
            onDelete={deleteItem}
            onAlarmPress={onAlarmPress}
            setShowButtons={setShowButtons}
          />
        </View>
      ) : (
        <View style={styles.emptyListContainer}>
          <Image
            style={{ width: 100, height: 100 }}
            source={
              isDarkTheme
                ? require('../../../assets/adaptive-icon.png')
                : require('../../../assets/adaptive-icon-light.png')
            }
          />
          <Text style={styles.emptyListText}>{i18n.t('noContentToShow')}</Text>
        </View>
      )}

      <IconButton
        name={showButtons ? 'minus' : 'plus'}
        onPress={onShowButtonsPress}
        containerStyle={{ ...styles.button, zIndex: 20 }}
        accessibilityLabel={showButtons ? i18n.t('cancel') : i18n.t('insertTitle')}
      />
      <AnimatedIconButton
        name="pencil"
        onPress={addItemText}
        position={80}
        showButton={showButtons}
        containerStyle={{ zIndex: 9 }}
        accessibilityLabel={i18n.t('newItemPlaceholder')}
      />
      <AnimatedIconButton
        name="microphone"
        onPress={onAudioButtonPress}
        position={140}
        showButton={showButtons}
        containerStyle={{ zIndex: 8 }}
        accessibilityLabel={i18n.t('pressToStartRecording')}
      />
      <AnimatedIconButton
        name="camera"
        onPress={onCameraButtonPress}
        position={200}
        showButton={showButtons}
        containerStyle={{ zIndex: 7 }}
        accessibilityLabel={i18n.t('cameraPermission')}
      />
      <AnimatedIconButton
        name="image"
        onPress={onGalleryButtonPress}
        position={260}
        showButton={showButtons}
        containerStyle={{ zIndex: 6 }}
        accessibilityLabel={i18n.t('photosPermission')}
      />
      <AnimatedIconButton
        name="calendar"
        onPress={onCalendarButtonPress}
        position={320}
        showButton={showButtons}
        containerStyle={{ zIndex: 5 }}
        accessibilityLabel={i18n.t('alarmTitle')}
      />
      <AnimatedIconButton
        name="list-alt"
        onPress={() => setChecksEnabled(!reminder.checksEnabled)}
        position={380}
        showButton={showButtons}
        color={
          reminder.checksEnabled
            ? isDarkTheme
              ? theme.primaryColor
              : theme.secondaryColor
            : theme.textColor
        }
        containerStyle={{
          zIndex: 6,
          ...(reminder.checksEnabled ? styles.checkButtonPressed : {}),
        }}
        accessibilityLabel={i18n.t('reorderItem')}
      />

      <ModalTitle
        visible={titleModalVisible}
        setVisible={setTitleModalVisible}
        saveTitle={saveTitle}
        title={reminder.title}
        goBack={() => navigation.goBack()}
      />
      <ModalTitle
        visible={alarmTitleModalVisible}
        setVisible={setAlarmTitleModalVisible}
        saveTitle={saveAlarmTitle}
        title={alarmTitle}
        modalTitle={i18n.t('alarmTitle')}
        cancelButton
        goBack={resetAlarmDraft}
      />
      <ModalImage item={selectedImage} visible={showModalImage} setVisible={setShowModalImage} />
      <ModalAudio
        saveAudio={addAudioItem}
        visible={showModalAudio}
        setVisible={setShowModalAudio}
      />

      {showDatePicker ? (
        <RNDateTimePicker
          onChange={handleOnDatePick}
          mode="date"
          display="calendar"
          value={datePicked}
        />
      ) : null}
      {showTimePicker ? (
        <RNDateTimePicker
          onChange={handleOnTimePick}
          mode="time"
          display="clock"
          value={datePicked}
          is24Hour
        />
      ) : null}
    </Layout>
  );
};

export default ReminderScreen;
