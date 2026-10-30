import { StyleSheet, Text, View, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useReorderableDrag } from 'react-native-reorderable-list';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Reminder, Theme } from '../../config/types';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.primaryColor,
      marginVertical: 8,
      marginHorizontal: 10,
      minHeight: 56,
      borderRadius: theme.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingLeft: 12,
    },
    grip: {
      paddingRight: 10,
      opacity: 0.6,
    },
    title: {
      flex: 1,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
    },
    deleteButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

type Props = {
  item: Reminder;
  onPress: () => void;
  onDelete: () => void;
};

const HomeItem = ({ item, onPress, onDelete }: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);
  const drag = useReorderableDrag();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.content}
        onPress={onPress}
        onLongPress={drag}
        delayLongPress={200}
        accessibilityRole="button"
        accessibilityLabel={item.title || i18n.t('openReminder')}
        accessibilityHint={i18n.t('reorderItem')}
      >
        <FontAwesome name="bars" size={16} color={theme.textColor} style={styles.grip} />
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('delete')}
      >
        <FontAwesome name="trash-o" size={18} color={theme.deleteButtonColor} />
      </Pressable>
    </View>
  );
};

export default HomeItem;
