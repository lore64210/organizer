import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';

const createStyles = (theme: Theme, isDarkTheme: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkTheme ? theme.textColor : theme.primaryColor,
      borderRadius: 6,
      zIndex: -5,
    },
    emptyCheckbox: {
      borderRadius: 6,
      backgroundColor: theme.primaryColor,
      height: 20,
      width: 20,
    },
  });

type Props = {
  isChecked?: boolean;
  onPress: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const Checkbox = ({ isChecked = false, onPress, style }: Props) => {
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const styles = createStyles(theme, isDarkTheme);

  return (
    <Pressable
      onPress={() => onPress(!isChecked)}
      style={[styles.container, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      hitSlop={8}
    >
      {isChecked ? (
        <FontAwesome
          name="check"
          color={isDarkTheme ? theme.primaryColor : theme.textColor}
          size={20}
        />
      ) : (
        <View style={styles.emptyCheckbox} />
      )}
    </Pressable>
  );
};

export default Checkbox;
