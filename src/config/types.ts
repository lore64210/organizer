export type AlarmValue = {
  /** ISO 8601 string in UTC, e.g. 2026-10-30T18:00:00.000Z */
  date: string;
  title: string;
  notificationId?: string | null;
};

export type ItemType = 'text' | 'audio' | 'alarm' | 'image';

export type Item = {
  id: string;
  type: ItemType;
  value: AlarmValue | string;
  checked?: boolean;
};

export type Reminder = {
  id: string;
  title: string;
  items: Item[];
  imageItems: Item[];
  checksEnabled?: boolean;
  createdAt?: number;
};

export type Theme = {
  textColor: string;
  placeholderTextColor: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  buttonSize: number;
  borderRadius: number;
  borderRadiusSmall: number;
  borderRadiusLarge: number;
  borderRadiusButton: number;
  deleteButtonColor: string;
};

export type RemindersState = {
  reminders: Reminder[];
  currentReminder: Reminder | null;
};

export type ThemeState = {
  theme: Theme;
  isDarkTheme: boolean;
  startThemeAnimation: boolean;
  themeAnimationOrigin: { x: number; y: number } | null;
};

export type RootState = {
  remindersReducer: RemindersState;
  themeReducer: ThemeState;
};

export const isAlarmValue = (value: Item['value']): value is AlarmValue =>
  typeof value === 'object' && value !== null;

export const isTextValue = (value: Item['value']): value is string =>
  typeof value === 'string';
