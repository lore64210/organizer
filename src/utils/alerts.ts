import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
};

/**
 * Cross-platform confirmation dialog.
 * `Alert.alert` is a no-op on web, so we fall back to `window.confirm`.
 */
export const confirm = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
}: ConfirmOptions): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const accepted =
      typeof window === 'undefined' ? true : window.confirm(`${title}\n\n${message}`);
    return Promise.resolve(accepted);
  }

  return new Promise(resolve => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
};

export const notify = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
};
