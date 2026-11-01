import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';
import { inset, raised } from '../../utils/neumorphic';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: theme.borderRadiusButton,
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

const DialogButton = ({ label, onPress, variant = 'ghost', disabled = false, style }: Props) => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const styles = createStyles(theme);
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const backgroundColor = isPrimary
    ? theme.accentColor
    : isDanger
      ? theme.deleteButtonColor
      : theme.surfaceColor;

  const color = isPrimary
    ? isDarkTheme
      ? theme.backgroundColor
      : '#FFFFFF'
    : isDanger
      ? '#FFFFFF'
      : theme.textColor;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        !isPrimary && !isDanger && (pressed ? inset(theme, 'sm') : raised(theme, 'sm')),
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

export default DialogButton;
