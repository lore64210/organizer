import { Directory, File, Paths } from 'expo-file-system';

const MEDIA_DIRECTORY = 'media';

const getMediaDirectory = (): Directory => {
  const directory = new Directory(Paths.document, MEDIA_DIRECTORY);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
};

/** True when the uri already points inside the app's persistent directory. */
export const isPersistedFile = (uri: string): boolean =>
  uri.startsWith(Paths.document.uri);

/**
 * Copies a file produced by the camera, the image picker or the recorder
 * (all of them live in the cache) into the app's document directory, which
 * the OS is allowed to clear. Returns the new uri, or the original one if it
 * cannot be persisted.
 */
export const persistFile = async (uri: string): Promise<string> => {
  if (!uri || !uri.startsWith('file://') || isPersistedFile(uri)) {
    return uri;
  }

  try {
    const source = new File(uri);
    if (!source.exists) {
      return uri;
    }

    const directory = getMediaDirectory();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${source.extension}`;
    const target = new File(directory, name);
    await source.copy(target);
    return target.uri;
  } catch (error) {
    console.warn('Could not persist file', uri, error);
    return uri;
  }
};

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
