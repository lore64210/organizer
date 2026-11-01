import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppSelector } from '../../config/redux/hooks';
import { useBlurTarget } from '../../providers/BlurTargetContext';
import { glassSurface } from '../../utils/neumorphic';

type Props = {
  children: ReactNode;
  onDismiss?: () => void;
  /** Extra bottom padding, e.g. to keep the card above the keyboard. */
  bottomOffset?: number;
  intensity?: number;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Glass dialog surface rendered above the app (outside the BlurTargetView).
 * Because it is a sibling of the blurred content, Android can sample the app
 * behind it correctly, including when the overlay sits on top of a screen.
 */
const GlassOverlay = ({
  children,
  onDismiss,
  bottomOffset = 0,
  intensity,
  contentStyle,
  accessibilityLabel,
}: Props) => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const blurTarget = useBlurTarget();

  const scale = useRef(new Animated.Value(0.94)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <View
      style={styles.overlay}
      pointerEvents="box-none"
      accessibilityViewIsModal
      onAccessibilityEscape={onDismiss}
    >
      <Pressable
        style={[
          styles.backdrop,
          {
            backgroundColor: theme.glassScrim,
            paddingBottom: 24 + bottomOffset,
          },
        ]}
        onPress={onDismiss}
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View
          style={[
            styles.shell,
            glassSurface(theme, theme.borderRadiusLarge),
            { opacity, transform: [{ scale }] },
          ]}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <BlurView
              intensity={intensity ?? (isDarkTheme ? 40 : 55)}
              tint={isDarkTheme ? 'dark' : 'light'}
              {...(Platform.OS === 'android'
                ? { blurMethod: 'dimezisBlurViewSdk31Plus', blurTarget }
                : null)}
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: theme.borderRadiusLarge,
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                },
              ]}
            />
            <View style={[styles.content, contentStyle]}>{children}</View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  backdrop: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  shell: {
    width: '100%',
    maxWidth: 400,
    borderCurve: 'continuous',
  },
  card: {
    width: '100%',
  },
  content: {
    padding: 22,
  },
});

export default GlassOverlay;
