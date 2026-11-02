import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { ComponentProps } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useReorderableDrag } from 'react-native-reorderable-list';
import i18n from '../../config/i18n';
import { useAppSelector } from '../../config/redux/hooks';
import type { Reminder, Theme } from '../../config/types';
import SwipeToDelete from './SwipeToDelete';

type IconName = ComponentProps<typeof FontAwesome>['name'];

type Tag = {
  key: string;
  icon: IconName;
  count: number;
  label: string;
};

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
      alignItems: 'flex-start',
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
    body: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      color: theme.textColor,
      fontFamily: 'Montserrat_400Regular',
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: theme.borderRadiusButton,
      backgroundColor: theme.insetColor,
      borderWidth: 1,
      borderColor: theme.hairlineColor,
    },
    tagText: {
      color: theme.mutedColor,
      fontSize: 10,
      fontFamily: 'Montserrat_700Bold',
    },
    tagChecklist: {
      borderColor: theme.accentColor,
    },
    tagChecklistText: {
      color: theme.accentColor,
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

  // Empty text rows are placeholders, not real content.
  const contentItems = item.items.filter(
    current =>
      current.type !== 'text' ||
      (typeof current.value === 'string' && current.value.trim().length > 0),
  );

  const imageCount = item.imageItems.length;
  const audioCount = contentItems.filter(current => current.type === 'audio').length;
  const alarmCount = contentItems.filter(current => current.type === 'alarm').length;
  const textCount = contentItems.filter(current => current.type === 'text').length;
  const checkedCount = contentItems.filter(current => current.checked).length;
  const totalCount = contentItems.length;

  const tags: Tag[] = [];
  if (imageCount > 0) {
    tags.push({
      key: 'images',
      icon: 'image',
      count: imageCount,
      label: i18n.t('tagImages', { count: imageCount }),
    });
  }
  if (audioCount > 0) {
    tags.push({
      key: 'audios',
      icon: 'microphone',
      count: audioCount,
      label: i18n.t('tagAudios', { count: audioCount }),
    });
  }
  if (alarmCount > 0) {
    tags.push({
      key: 'alarms',
      icon: 'clock-o',
      count: alarmCount,
      label: i18n.t('tagAlarms', { count: alarmCount }),
    });
  }
  if (textCount > 0) {
    tags.push({
      key: 'texts',
      icon: 'file-text-o',
      count: textCount,
      label: i18n.t('tagTexts', { count: textCount }),
    });
  }

  const checklistLabel = item.checksEnabled
    ? i18n.t('tagChecklist', { checked: checkedCount, total: totalCount })
    : '';
  const summary = [...tags.map(tag => tag.label), checklistLabel]
    .filter(Boolean)
    .join(', ');
  const baseLabel = item.title || i18n.t('openReminder');
  const accessibilityLabel = summary ? `${baseLabel}. ${summary}` : baseLabel;

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
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={i18n.t('reorderItem')}
        >
          <FontAwesome name="bars" size={16} color={theme.mutedColor} style={styles.grip} />
          <View style={styles.body}>
            <Text numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>
            {tags.length > 0 || item.checksEnabled ? (
              <View style={styles.tags}>
                {tags.map(tag => (
                  <View key={tag.key} style={styles.tag}>
                    <FontAwesome name={tag.icon} size={10} color={theme.mutedColor} />
                    <Text style={styles.tagText}>{tag.count}</Text>
                  </View>
                ))}
                {item.checksEnabled ? (
                  <View style={[styles.tag, styles.tagChecklist]}>
                    <FontAwesome name="list-alt" size={10} color={theme.accentColor} />
                    <Text style={[styles.tagText, styles.tagChecklistText]}>
                      {checkedCount}/{totalCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Pressable>
      </View>
    </SwipeToDelete>
  );
};

export default HomeItem;
