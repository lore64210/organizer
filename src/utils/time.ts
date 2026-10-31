const pad = (value: number) => value.toString().padStart(2, '0');

/** Formats a duration in seconds as m:ss. */
export const formatSeconds = (seconds: number): string => {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(total / 60);
  return `${minutes}:${pad(total % 60)}`;
};
