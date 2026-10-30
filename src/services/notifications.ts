import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/** Installs the foreground handler and the Android channel. Safe to call once at startup. */
export const configureNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
};

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

/** Schedules a one-shot local notification and returns its id (or null if not allowed). */
export const scheduleAlarm = async (
  title: string,
  date: Date,
): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const granted = await ensureNotificationPermission();
    if (!granted) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: { title, sound: false },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  } catch (error) {
    console.warn('Could not schedule notification', error);
    return null;
  }
};

export const cancelAlarm = async (notificationId?: string | null): Promise<void> => {
  if (!notificationId) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Could not cancel notification', notificationId, error);
  }
};
