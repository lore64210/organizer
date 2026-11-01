import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import DialogButton from '../components/atoms/DialogButton';
import { createModalStyles } from '../components/molecules/modalStyles';
import i18n from '../config/i18n';
import { useAppSelector } from '../config/redux/hooks';

export type DialogOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type InternalDialog = DialogOptions & { showCancel: boolean };

type DialogContextValue = {
  confirm: (options: DialogOptions) => Promise<boolean>;
  notify: (options: DialogOptions) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used inside DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createModalStyles(theme);

  const [dialog, setDialog] = useState<InternalDialog | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const scale = useRef(new Animated.Value(0.94)).current;

  const open = useCallback(
    (options: DialogOptions, showCancel: boolean): Promise<boolean> =>
      new Promise(resolve => {
        resolver.current?.(false);
        resolver.current = resolve;
        scale.setValue(0.94);
        setDialog({ ...options, showCancel });
      }),
    [scale],
  );

  const close = useCallback(
    (result: boolean) => {
      resolver.current?.(result);
      resolver.current = null;
      setDialog(null);
    },
    [],
  );

  const confirm = useCallback(
    (options: DialogOptions) => open(options, true),
    [open],
  );

  const notify = useCallback(
    (options: DialogOptions) => {
      open(options, false);
    },
    [open],
  );

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const isDestructive = !!dialog?.destructive;

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}

      <Modal
        visible={!!dialog}
        transparent
        animationType="fade"
        statusBarTranslucent
        onShow={animateIn}
        onRequestClose={() => close(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => close(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            {dialog ? (
              <>
                <Text style={styles.title}>{dialog.title}</Text>
                {dialog.message ? (
                  <Text style={styles.message}>{dialog.message}</Text>
                ) : null}
                <View style={styles.actions}>
                  {dialog.showCancel ? (
                    <DialogButton
                      label={dialog.cancelLabel ?? i18n.t('cancel')}
                      onPress={() => close(false)}
                    />
                  ) : null}
                  <DialogButton
                    label={
                      dialog.confirmLabel ??
                      (dialog.showCancel ? i18n.t('delete') : i18n.t('ok'))
                    }
                    variant={isDestructive ? 'danger' : 'primary'}
                    onPress={() => close(true)}
                  />
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
};
