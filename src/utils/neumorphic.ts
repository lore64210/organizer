import { Platform, type ViewStyle } from 'react-native';
import type { Theme } from '../config/types';

/**
 * Neumorphism helpers.
 *
 * `boxShadow` is a native style in React Native 0.76+ (New Architecture) and
 * supports multiple shadows and the `inset` keyword, which is exactly what the
 * style needs. Older Android releases get a hairline fallback instead.
 */

type ElevationLevel = 'sm' | 'md' | 'lg';

const OFFSET: Record<ElevationLevel, number> = { sm: 3, md: 6, lg: 10 };

const androidVersion = Platform.OS === 'android' ? Number(Platform.Version) : 0;

/** Outset shadows: Android 9 (API 28) and above. */
export const supportsOutsetShadow =
  Platform.OS !== 'android' || androidVersion >= 28;

/** Inset shadows: Android 10 (API 29) and above. */
export const supportsInsetShadow =
  Platform.OS !== 'android' || androidVersion >= 29;

/**
 * Raised surface: light from the top-left, shadow to the bottom-right.
 * The surface color must match the background for the effect to read.
 */
export const raised = (theme: Theme, level: ElevationLevel = 'md'): ViewStyle => {
  if (!supportsOutsetShadow) {
    return { borderWidth: 1, borderColor: theme.hairlineColor };
  }

  const d = OFFSET[level];
  const blur = d * 2;

  return {
    boxShadow: `${d}px ${d}px ${blur}px ${theme.shadowDark}, -${d}px -${d}px ${blur}px ${theme.shadowLight}`,
  } as ViewStyle;
};

/** Pressed / recessed surface: the same shadows, but inside the box. */
export const inset = (theme: Theme, level: ElevationLevel = 'sm'): ViewStyle => {
  if (!supportsInsetShadow) {
    return {
      backgroundColor: theme.insetColor,
      borderWidth: 1,
      borderColor: theme.hairlineColor,
    };
  }

  const d = OFFSET[level];
  const blur = d * 2;

  return {
    boxShadow: `inset ${d}px ${d}px ${blur}px ${theme.shadowDark}, inset -${d}px -${d}px ${blur}px ${theme.shadowLight}`,
  } as ViewStyle;
};

/** Glass overlay: single soft drop shadow plus a specular top edge. */
export const glassSurface = (theme: Theme, radius: number): ViewStyle =>
  ({
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: radius,
    boxShadow: `0 18px 40px ${theme.glassShadow}, inset 0 1px 0 ${theme.glassHighlight}`,
  }) as ViewStyle;
