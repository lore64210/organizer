import { createContext, useContext } from 'react';
import type { BlurViewProps } from 'expo-blur';

/**
 * Ref to the BlurTargetView that wraps the app content. Glass overlays render
 * outside that view (so they are not part of the snapshot they blur) but still
 * need the ref to sample it on Android.
 */
export const BlurTargetContext = createContext<BlurViewProps['blurTarget']>(undefined);

export const useBlurTarget = () => useContext(BlurTargetContext);

export const BlurTargetProvider = BlurTargetContext.Provider;
