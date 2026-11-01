import { StyleSheet, Text, View, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useReorderableDrag } from 'react-native-reorderable-list';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Reminder, Theme } from '../../config/types';
import SwipeToDelete from './SwipeToDelete';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    swipeContainer: {
      marginVertical: 10,
      marginHorizontal: 12,
    },
    container: {
      backgroundColor: theme.surfaceColor,
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingLeft: 12,
      paddingRight: 12,
    },
    grip: {
      alignSelf: 'flex-start',
      paddingTop: 2,
      paddingRight: 10,
      opacity: 0.6,
    },
    title: {
      flex: 1,
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
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
    <SwipeToDelete
      style={styles.swipeContainer}
      onDelete={onDelete}
      accessibilityLabel={i18n.t('delete')}
    >
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
          <FontAwesome name="bars" size={16} color={theme.mutedColor} style={styles.grip} />
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
        </Pressable>
      </View>
    </SwipeToDelete>
  );
};

export default HomeItem;
