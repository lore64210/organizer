import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppSelector } from '../../config/redux/hooks';
import { swipeActionColor } from '../../config/theme';

const ACTION_WIDTH = 76;

const styles = StyleSheet.create({
  action: {
    width: ACTION_WIDTH,
    height: '100%',
    backgroundColor: swipeActionColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type Props = {
  children: ReactNode;
  onDelete: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  /**
   * Gestures that must be able to run at the same time as the swipe.
   * Used for native components (TextInput) that would otherwise swallow the pan.
   */
  simultaneousWith?: React.ComponentProps<typeof ReanimatedSwipeable>['simultaneousWith'];
};

/**
 * Swipe a row to the left to reveal a red delete action.
 * The row keeps its normal layout (and height) while closed.
 */
const SwipeToDelete = ({
  children,
  onDelete,
  accessibilityLabel,
  style,
  simultaneousWith,
}: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={ACTION_WIDTH / 2}
      overshootRight={false}
      simultaneousWith={simultaneousWith}
      containerStyle={[
        {
          borderRadius: theme.borderRadius,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: theme.primaryColor,
        },
        style,
      ]}
      renderRightActions={(_progress, _translation, methods) => (
        <Pressable
          style={styles.action}
          onPress={() => {
            methods.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <FontAwesome name="trash" size={22} color="#000000" />
        </Pressable>
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
};

export default SwipeToDelete;
