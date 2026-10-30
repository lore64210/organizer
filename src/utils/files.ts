import { File } from 'expo-file-system';

/** Deletes a local file (audio recording, picked image, etc.) ignoring missing files. */
export const deleteFile = (uri?: string | null) => {
  if (!uri || !uri.startsWith('file://')) {
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('Could not delete file', uri, error);
  }
};
