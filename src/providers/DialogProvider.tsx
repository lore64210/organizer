import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView, BlurTargetView } from 'expo-blur';
import DialogButton from '../components/atoms/DialogButton';
import { createModalStyles } from '../components/molecules/modalStyles';
import i18n from '../config/i18n';
import { useAppSelector } from '../config/redux/hooks';
import { glassSurface } from '../utils/neumorphic';
import { BlurTargetProvider } from './BlurTargetContext';
import { OverlayHost } from './OverlayProvider';

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  target: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    elevation: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  cardShell: {
    width: '100%',
    maxWidth: 400,
    borderCurve: 'continuous',
  },
  blur: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  content: {
    padding: 22,
  },
});

/**
 * Dialogs live in an overlay inside the same native window (instead of a
 * native Modal). That is what allows `BlurView` to sample the app behind it
 * on Android: a Modal is rendered in a separate window and cannot be blurred.
 */
export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const modalStyles = createModalStyles(theme);

  const [dialog, setDialog] = useState<InternalDialog | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const scale = useRef(new Animated.Value(0.94)).current;
  const blurTargetRef = useRef<ComponentRef<typeof View> | null>(null);

  const open = useCallback(
    (options: DialogOptions, showCancel: boolean): Promise<boolean> =>
      new Promise(resolve => {
        resolver.current?.(false);
        resolver.current = resolve;
        setDialog({ ...options, showCancel });
      }),
    [],
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

  useEffect(() => {
    if (!dialog) {
      return;
    }
    scale.setValue(0.94);
    Animated.spring(scale, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [dialog, scale]);

  useEffect(() => {
    if (!dialog || Platform.OS !== 'android') {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close(false);
      return true;
    });
    return () => subscription.remove();
  }, [dialog, close]);

  const isDestructive = !!dialog?.destructive;

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      <BlurTargetProvider value={blurTargetRef}>
        <View style={styles.root}>
          <BlurTargetView ref={blurTargetRef} style={styles.target}>
            {children}
          </BlurTargetView>

          <OverlayHost />

          {dialog ? (
            <View
              style={styles.overlay}
              accessibilityViewIsModal
              importantForAccessibility="yes"
              onAccessibilityEscape={() => close(false)}
            >
              <Pressable
                style={[
                  StyleSheet.absoluteFill,
                  modalStyles.backdrop,
                  { backgroundColor: theme.glassScrim, padding: 24 },
                ]}
                onPress={() => close(false)}
              >
                <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
                  <Pressable
                    style={[styles.cardShell, glassSurface(theme, theme.borderRadiusLarge)]}
                    onPress={() => {}}
                  >
                    <BlurView
                      intensity={isDarkTheme ? 40 : 55}
                      tint={isDarkTheme ? 'dark' : 'light'}
                      {...(Platform.OS === 'android'
                        ? {
                            blurMethod: 'dimezisBlurViewSdk31Plus',
                            blurTarget: blurTargetRef,
                          }
                        : null)}
                      style={[
                        styles.blur,
                        {
                          borderRadius: theme.borderRadiusLarge,
                          backgroundColor: 'transparent',
                        },
                      ]}
                    />
                    <View style={styles.content}>
                      <Text style={modalStyles.title}>{dialog.title}</Text>
                      {dialog.message ? (
                        <Text style={modalStyles.message}>{dialog.message}</Text>
                      ) : null}
                      <View style={modalStyles.actions}>
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
                    </View>
                  </Pressable>
                </Animated.View>
              </Pressable>
            </View>
          ) : null}
        </View>
      </BlurTargetProvider>
    </DialogContext.Provider>
  );
};
