import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';
import { inset, raised } from '../../utils/neumorphic';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surfaceColor,
      borderRadius: 7,
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

type Props = {
  isChecked?: boolean;
  onPress: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const Checkbox = ({ isChecked = false, onPress, style }: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={() => onPress(!isChecked)}
      style={[
        styles.container,
        style,
        isChecked ? inset(theme, 'sm') : raised(theme, 'sm'),
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      hitSlop={8}
    >
      {isChecked ? (
        <FontAwesome name="check" color={theme.accentColor} size={14} />
      ) : null}
    </Pressable>
  );
};

export default Checkbox;
