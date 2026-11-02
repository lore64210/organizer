import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppSelector } from '../../config/redux/hooks';
import { useBlurTarget } from '../../providers/BlurTargetContext';

type Props = {
  intensity?: number;
};

/**
 * Full-screen blurred backdrop for overlays that cover the app.
 * Must be rendered outside the BlurTargetView (the overlay host handles that).
 */
const GlassBackdrop = ({ intensity = 35 }: Props) => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const blurTarget = useBlurTarget();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView
        intensity={intensity}
        tint={isDarkTheme ? 'dark' : 'light'}
        {...(Platform.OS === 'android'
          ? { blurMethod: 'dimezisBlurViewSdk31Plus', blurTarget }
          : null)}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.glassScrim },
        ]}
      />
    </View>
  );
};

export default GlassBackdrop;
