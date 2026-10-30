import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ReorderableList, { useReorderableDrag } from 'react-native-reorderable-list';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Item, Theme } from '../../config/types';
import { moveItem } from '../../utils/reorder';

const createStyles = (theme: Theme, window: ReturnType<typeof useWindowDimensions>) =>
  StyleSheet.create({
    container: {
      marginTop: 20,
      alignItems: 'center',
      height: window.height / 4 + 20,
    },
    listContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primaryColor,
      width: '95%',
      borderRadius: theme.borderRadius,
      paddingHorizontal: 6,
      height: window.height / 4,
    },
    thumb: {
      width: window.width / 4 - 20,
      height: window.height / 4 - 16,
      marginHorizontal: 5,
      borderRadius: theme.borderRadius,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    removeBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.deleteButtonColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

type ThumbProps = {
  item: Item;
  onPress: (item: Item) => void;
  onDelete: (item: Item) => void;
  styles: ReturnType<typeof createStyles>;
};

const ImageThumb = ({ item, onPress, onDelete, styles }: ThumbProps) => {
  const drag = useReorderableDrag();
  const uri = typeof item.value === 'string' ? item.value : '';

  return (
    <Pressable
      style={styles.thumb}
      onPress={() => onPress(item)}
      onLongPress={drag}
      delayLongPress={200}
      accessibilityRole="imagebutton"
      accessibilityLabel={i18n.t('openReminder')}
      accessibilityHint={i18n.t('reorderItem')}
    >
      <Image style={styles.image} source={{ uri }} resizeMode="cover" />
      <Pressable
        style={styles.removeBadge}
        onPress={() => onDelete(item)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('delete')}
      >
        <FontAwesome name="times" size={12} color="#FFFFFF" />
      </Pressable>
    </Pressable>
  );
};

type Props = {
  items: Item[];
  onPress: (item: Item) => void;
  onDelete: (item: Item) => void;
  onReorder: (items: Item[]) => void;
};

const ImageItemList = ({ items, onPress, onDelete, onReorder }: Props) => {
  const window = useWindowDimensions();
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme, window);

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <ReorderableList
          horizontal
          data={items}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          onReorder={({ from, to }) => onReorder(moveItem(items, from, to))}
          renderItem={({ item }) => (
            <ImageThumb item={item} onPress={onPress} onDelete={onDelete} styles={styles} />
          )}
        />
      </View>
    </View>
  );
};

export default ImageItemList;
