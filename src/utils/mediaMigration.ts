import { Platform } from 'react-native';
import { persistFile } from './files';
import type { Item, Reminder } from '../config/types';

const MEDIA_TYPES = new Set(['audio', 'image']);

type MigrateItemsResult = {
  items: Item[];
  changed: boolean;
};

const migrateItems = async (items: Item[]): Promise<MigrateItemsResult> => {
  let changed = false;

  const migrated = await Promise.all(
    items.map(async item => {
      if (!MEDIA_TYPES.has(item.type) || typeof item.value !== 'string') {
        return item;
      }
      const uri = await persistFile(item.value);
      if (uri === item.value) {
        return item;
      }
      changed = true;
      return { ...item, value: uri };
    }),
  );

  return { items: changed ? migrated : items, changed };
};

/**
 * Moves media referenced by persisted reminders from the cache to the document
 * directory. Returns the same array when there is nothing to migrate, so the
 * caller can skip dispatching.
 */
export const migrateRemindersMedia = async (reminders: Reminder[]): Promise<Reminder[]> => {
  if (Platform.OS === 'web') {
    return reminders;
  }

  let anyChanged = false;
  const migrated: Reminder[] = [];

  for (const reminder of reminders) {
    const items = await migrateItems(reminder.items);
    const images = await migrateItems(reminder.imageItems);

    if (items.changed || images.changed) {
      anyChanged = true;
      migrated.push({ ...reminder, items: items.items, imageItems: images.items });
    } else {
      migrated.push(reminder);
    }
  }

  return anyChanged ? migrated : reminders;
};
