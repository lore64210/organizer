import { useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ReorderableList from 'react-native-reorderable-list';
import i18n from '../../config/i18n';
import { useAppDispatch, useAppSelector } from '../../config/redux/hooks';
import {
  DELETE_REMINDER,
  SET_CURRENT_REMINDER,
  SET_ORDERED_REMINDERS,
} from '../../config/redux/actions';
import { isAlarmValue, type Item, type Reminder, type Theme } from '../../config/types';
import { IconButton } from '../atoms';
import { HomeItem, Layout } from '../molecules';
import { cancelAlarm } from '../../services/notifications';
import { confirm } from '../../utils/alerts';
import { deleteFile } from '../../utils/files';
import { migrateRemindersMedia } from '../../utils/mediaMigration';
import { moveItem } from '../../utils/reorder';
import generateUUID from '../../utils/uuidUtil';

const createStyles = (theme: Theme, isDarkTheme: boolean) =>
  StyleSheet.create({
    button: {
      borderWidth: 2,
    },
    listContainer: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
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

const createEmptyReminder = (): Reminder => {
  const firstItem: Item = {
    id: generateUUID(),
    value: '',
    type: 'text',
    checked: false,
  };

  return {
    id: generateUUID(),
    title: '',
    items: [firstItem],
    imageItems: [],
    checksEnabled: false,
    createdAt: Date.now(),
  };
};

const cleanupFiles = (items: Item[]) => {
  items.forEach(item => {
    if (typeof item.value === 'string' && item.type === 'audio') {
      deleteFile(item.value);
    }
    if (isAlarmValue(item.value)) {
      cancelAlarm(item.value.notificationId);
    }
  });
};

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const reminders = useAppSelector(state => state.remindersReducer.reminders);
  const styles = createStyles(theme, isDarkTheme);

  // One-time migration: media used to live in the cache directory.
  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;
  const migrationStarted = useRef(false);

  useEffect(() => {
    if (migrationStarted.current) {
      return;
    }
    migrationStarted.current = true;

    let cancelled = false;
    migrateRemindersMedia(remindersRef.current).then(migrated => {
      if (cancelled) {
        return;
      }
      const migratedById = new Map(migrated.map(reminder => [reminder.id, reminder]));
      const next = remindersRef.current.map(
        reminder => migratedById.get(reminder.id) ?? reminder,
      );
      const changed = next.some((reminder, index) => reminder !== remindersRef.current[index]);
      if (changed) {
        dispatch({ type: SET_ORDERED_REMINDERS, payload: next });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const openReminder = (reminder: Reminder) => {
    dispatch({ type: SET_CURRENT_REMINDER, payload: reminder });
    navigation.navigate('ReminderScreen');
  };

  const createReminder = () => {
    openReminder(createEmptyReminder());
  };

  const deleteReminder = async (reminder: Reminder) => {
    const accepted = await confirm({
      title: i18n.t('deleteReminderTitle'),
      message: i18n.t('deleteReminderMessage', { title: reminder.title }),
      confirmLabel: i18n.t('delete'),
      cancelLabel: i18n.t('cancel'),
    });
    if (!accepted) {
      return;
    }
    cleanupFiles(reminder.items);
    cleanupFiles(reminder.imageItems);
    dispatch({ type: DELETE_REMINDER, payload: reminder });
  };

  return (
    <Layout headerProps={{ title: 'O R G A N I Z E R' }}>
      {reminders.length ? (
        <View style={styles.listContainer}>
          <ReorderableList
            data={reminders}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            onReorder={({ from, to }) =>
              dispatch({
                type: SET_ORDERED_REMINDERS,
                payload: moveItem(reminders, from, to),
              })
            }
            renderItem={({ item }) => (
              <HomeItem
                item={item}
                onPress={() => openReminder(item)}
                onDelete={() => deleteReminder(item)}
              />
            )}
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
          <Text style={styles.emptyListText}>{i18n.t('noItemsToShow')}</Text>
        </View>
      )}
      <IconButton
        containerStyle={styles.button}
        name="plus"
        onPress={createReminder}
        accessibilityLabel={i18n.t('insertTitle')}
      />
    </Layout>
  );
};

export default HomeScreen;
