import { Pressable, StyleSheet, type GestureResponderEvent, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';
import { inset, raised } from '../../utils/neumorphic';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surfaceColor,
      borderRadius: theme.borderRadiusButton,
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: theme.buttonSize,
      height: theme.buttonSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

type IconName = ComponentProps<typeof FontAwesome>['name'];

type Props = {
  name: IconName;
  color?: string;
  size?: number;
  onPress?: (event: GestureResponderEvent) => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
  /** Set to false for controls that float over media and must stay flat. */
  elevated?: boolean;
};

const IconButton = ({
  name,
  color,
  size = 20,
  onPress = () => {},
  style,
  containerStyle,
  onPressIn = () => {},
  onPressOut = () => {},
  onLongPress,
  accessibilityLabel,
  disabled = false,
  elevated = true,
}: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      onLongPress={disabled ? undefined : onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.container,
        containerStyle,
        elevated && (pressed ? inset(theme, 'md') : raised(theme, 'md')),
        disabled && { opacity: 0.5 },
      ]}
    >
      <FontAwesome style={style} name={name} color={color ?? theme.textColor} size={size} />
    </Pressable>
  );
};

export default IconButton;
