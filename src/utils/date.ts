const pad = (value: number) => value.toString().padStart(2, '0');

/** Combines a picked date with a picked time into a single local Date. */
export const toAlarmDate = (date: Date, time: Date): Date => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
};

export const formatAlarmDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatAlarmTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const isPastDate = (isoDate: string): boolean =>
  new Date(isoDate).getTime() <= Date.now();

export const toDatePicked = (isoDate?: string): Date =>
  isoDate ? new Date(isoDate) : new Date();
