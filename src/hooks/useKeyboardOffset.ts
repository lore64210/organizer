import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';

/**
 * Extra bottom offset needed to keep floating elements above the keyboard.
 *
 * On iOS the window does not resize, so the offset is the keyboard height.
 * On Android the window may already resize (`softwareKeyboardLayoutMode: resize`),
 * in which case we return 0 to avoid shifting the element twice. With edge-to-edge
 * the window can stay the same height, and then the offset is applied.
 */
export const useKeyboardOffset = (): number => {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const windowHeightWithoutKeyboard = useRef(windowHeight);

  useEffect(() => {
    if (keyboardHeight === 0) {
      windowHeightWithoutKeyboard.current = windowHeight;
    }
  }, [keyboardHeight, windowHeight]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!keyboardHeight) {
    return 0;
  }

  // How much the window itself got smaller because of the keyboard.
  const resized = Math.max(0, windowHeightWithoutKeyboard.current - windowHeight);
  return Math.max(0, keyboardHeight - resized);
};
