import { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import ReorderableList, { useReorderableDrag } from 'react-native-reorderable-list';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import { isAlarmValue, type Item, type Theme } from '../../config/types';
import { formatAlarmDate, formatAlarmTime } from '../../utils/date';
import { moveItem } from '../../utils/reorder';
import { Checkbox, IconButton } from '../atoms';

const URL_PATTERN = /^(https?:\/\/|www\.)\S+$/i;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    checkbox: {
      position: 'absolute',
      left: '2.5%',
      top: 30,
      zIndex: 2,
    },
    itemContainer: {
      backgroundColor: theme.primaryColor,
      marginVertical: 8,
      marginRight: '2.5%',
      borderRadius: theme.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
    },
    grip: {
      paddingVertical: 14,
      paddingLeft: 10,
      paddingRight: 4,
      opacity: 0.6,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    textItem: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      minHeight: 46,
      textAlignVertical: 'top',
    },
    action: {
      width: 40,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alarmItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    alarmItem: {
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
    },
    alarmTitle: {
      fontWeight: 'bold',
    },
    audioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 4,
    },
    audioButton: {
      position: 'relative',
      left: 0,
      bottom: 0,
      width: 40,
      height: 40,
      backgroundColor: 'transparent',
    },
    audioSlider: {
      flex: 1,
      height: 36,
    },
    audioTime: {
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
      fontSize: 11,
      minWidth: 74,
      textAlign: 'right',
      paddingRight: 6,
    },
  });

const formatSeconds = (seconds: number): string => {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(total / 60);
  return `${minutes}:${(total % 60).toString().padStart(2, '0')}`;
};

type AudioItemProps = {
  uri: string;
  activeId: string | null;
  onActivate: (id: string | null) => void;
  itemId: string;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
};

const AudioItem = ({ uri, activeId, onActivate, itemId, styles, theme }: AudioItemProps) => {
  const player = useAudioPlayer({ uri }, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const isActive = activeId === itemId;

  useEffect(() => {
    if (!isActive && status.playing) {
      player.pause();
    }
  }, [isActive]);

  const toggle = () => {
    if (status.playing) {
      player.pause();
      onActivate(null);
      return;
    }
    onActivate(itemId);
    if (status.didJustFinish || status.currentTime >= (status.duration || 0)) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={styles.audioItem}>
      <IconButton
        name={status.playing ? 'pause' : 'play'}
        onPress={toggle}
        containerStyle={styles.audioButton}
        color={theme.textColor}
        accessibilityLabel={i18n.t(status.playing ? 'pauseAudio' : 'playAudio')}
      />
      <View style={styles.audioSlider}>
        <Slider
          style={{ width: '100%', height: '100%' }}
          minimumValue={0}
          maximumValue={status.duration > 0 ? status.duration : 1}
          minimumTrackTintColor={theme.textColor}
          maximumTrackTintColor={theme.backgroundColor}
          thumbTintColor={theme.textColor}
          onSlidingComplete={value => player.seekTo(value)}
          value={status.currentTime}
        />
      </View>
      <Text style={styles.audioTime}>
        {formatSeconds(status.currentTime)} / {formatSeconds(status.duration)}
      </Text>
    </View>
  );
};

type RowProps = {
  item: Item;
  checksEnabled: boolean;
  changeItemText: (text: string, id: string) => void;
  changeItemCheck: (checked: boolean, id: string) => void;
  onDelete: (item: Item) => void;
  onAlarmPress: (id: string) => void;
  setShowButtons: (visible: boolean) => void;
  inputRef: (input: TextInputInstance | null) => void;
  activeAudioId: string | null;
  onActivateAudio: (id: string | null) => void;
};

const ItemRow = ({
  item,
  checksEnabled,
  changeItemText,
  changeItemCheck,
  onDelete,
  onAlarmPress,
  setShowButtons,
  inputRef,
  activeAudioId,
  onActivateAudio,
}: RowProps) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);
  const drag = useReorderableDrag();

  const textValue = typeof item.value === 'string' ? item.value : '';
  const trimmedText = textValue.trim();
  const link = URL_PATTERN.test(trimmedText)
    ? trimmedText.startsWith('www.')
      ? `https://${trimmedText}`
      : trimmedText
    : null;

  const openLink = () => {
    if (link) {
      Linking.openURL(link).catch(() => {});
    }
  };

  const renderContent = () => {
    if (item.type === 'alarm' && isAlarmValue(item.value)) {
      return (
        <Pressable
          style={styles.alarmItemContent}
          onPress={() => onAlarmPress(item.id)}
          accessibilityRole="button"
        >
          <FontAwesome
            name="clock-o"
            size={22}
            color={theme.textColor}
            style={{ paddingHorizontal: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.alarmItem, styles.alarmTitle]} numberOfLines={1}>
              {item.value.title}
            </Text>
            <Text style={styles.alarmItem}>
              {i18n.t('date')} {formatAlarmDate(item.value.date)} {formatAlarmTime(item.value.date)}hs
            </Text>
          </View>
        </Pressable>
      );
    }

    if (item.type === 'audio') {
      return (
        <AudioItem
          uri={textValue}
          itemId={item.id}
          activeId={activeAudioId}
          onActivate={onActivateAudio}
          styles={styles}
          theme={theme}
        />
      );
    }

    return (
      <TextInput
        ref={inputRef}
        multiline
        style={styles.textItem}
        onChangeText={newText => changeItemText(newText, item.id)}
        onFocus={() => setShowButtons(false)}
        placeholderTextColor={theme.placeholderTextColor}
        placeholder={i18n.t('newItemPlaceholder')}
        value={textValue}
      />
    );
  };

  return (
    <View style={styles.row}>
      {checksEnabled && item.type !== 'alarm' && item.type !== 'audio' ? (
        <Checkbox
          style={styles.checkbox}
          isChecked={item.checked}
          onPress={checked => changeItemCheck(checked, item.id)}
        />
      ) : null}
      <View style={[styles.itemContainer, { width: checksEnabled && item.type === 'text' ? '86%' : '95%' }]}>
        <Pressable
          onLongPress={drag}
          delayLongPress={150}
          style={styles.grip}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('reorderItem')}
          hitSlop={6}
        >
          <FontAwesome name="reorder" size={15} color={theme.textColor} />
        </Pressable>
        <View style={styles.content}>{renderContent()}</View>
        {link ? (
          <Pressable
            style={styles.action}
            onPress={openLink}
            hitSlop={6}
            accessibilityRole="link"
            accessibilityLabel={i18n.t('openLink')}
          >
            <FontAwesome name="external-link" size={16} color={theme.textColor} />
          </Pressable>
        ) : null}
        <Pressable
          style={styles.action}
          onPress={() => onDelete(item)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('deleteItem')}
        >
          <FontAwesome name="trash-o" size={16} color={theme.deleteButtonColor} />
        </Pressable>
      </View>
    </View>
  );
};

type Props = {
  items: Item[];
  actualItemTextId: string | null;
  changeItemText: (text: string, id: string) => void;
  checksEnabled?: boolean;
  changeItemCheck: (checked: boolean, id: string) => void;
  onReorder: (items: Item[]) => void;
  onDelete: (item: Item) => void;
  onAlarmPress: (id: string) => void;
  setShowButtons: (visible: boolean) => void;
};

const ItemList = ({
  items,
  actualItemTextId,
  changeItemText,
  checksEnabled = false,
  changeItemCheck,
  onReorder,
  onDelete,
  onAlarmPress,
  setShowButtons,
}: Props) => {
  const textItemsRef = useRef<Record<string, TextInputInstance | null>>({});
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  useEffect(() => {
    const input = actualItemTextId ? textItemsRef.current[actualItemTextId] : null;
    input?.focus();
  }, [actualItemTextId]);

  return (
    <ReorderableList
      data={items}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingBottom: 140 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      style={{ flex: 1 }}
      onReorder={({ from, to }) => onReorder(moveItem(items, from, to))}
      renderItem={({ item }) => (
        <ItemRow
          item={item}
          checksEnabled={checksEnabled}
          changeItemText={changeItemText}
          changeItemCheck={changeItemCheck}
          onDelete={onDelete}
          onAlarmPress={onAlarmPress}
          setShowButtons={setShowButtons}
          inputRef={input => {
            textItemsRef.current[item.id] = input;
          }}
          activeAudioId={activeAudioId}
          onActivateAudio={setActiveAudioId}
        />
      )}
      extraData={activeAudioId}
    />
  );
};

export default ItemList;
