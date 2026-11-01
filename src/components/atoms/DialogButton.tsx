import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useAppSelector } from '../../config/redux/hooks';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const DialogButton = ({ label, onPress, variant = 'ghost', disabled = false, style }: Props) => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);

  const backgroundColor =
    variant === 'primary'
      ? isDarkTheme
        ? theme.textColor
        : theme.secondaryColor
      : variant === 'danger'
        ? theme.deleteButtonColor
        : 'transparent';

  const color =
    variant === 'primary'
      ? isDarkTheme
        ? theme.backgroundColor
        : theme.textColor
      : variant === 'danger'
        ? '#FFFFFF'
        : theme.textColor;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      hitSlop={4}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default DialogButton;
