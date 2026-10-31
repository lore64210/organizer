import { StyleSheet, TouchableHighlight, type GestureResponderEvent, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.primaryColor,
      borderRadius: theme.borderRadiusButton,
      borderColor: theme.backgroundColor,
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
}: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);

  return (
    <TouchableHighlight
      underlayColor={theme.backgroundColor}
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      onLongPress={disabled ? undefined : onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[styles.container, containerStyle, disabled && { opacity: 0.5 }]}
    >
      <FontAwesome style={style} name={name} color={color ?? theme.textColor} size={size} />
    </TouchableHighlight>
  );
};

export default IconButton;
