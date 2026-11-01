import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppSelector } from '../../config/redux/hooks';
import { swipeActionColor } from '../../config/theme';
import { raised } from '../../utils/neumorphic';

const ACTION_WIDTH = 76;

const styles = StyleSheet.create({
  shadow: {
    borderCurve: 'continuous',
  },
  clip: {
    overflow: 'hidden',
  },
  action: {
    width: ACTION_WIDTH,
    height: '100%',
    marginVertical: 1,
    marginRight: 1,
    backgroundColor: swipeActionColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPress: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type DeleteActionProps = {
  progress: SharedValue<number>;
  radius: number;
  onPress: () => void;
  accessibilityLabel: string;
};

/**
 * The delete action lives behind the row. Fading it with the swipe progress
 * keeps it completely invisible while the row is closed, so its red can never
 * peek through a rounded corner or a translucent overlay.
 */
const DeleteAction = ({ progress, radius, onPress, accessibilityLabel }: DeleteActionProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Animated.View
      style={[
        styles.action,
        {
          borderTopRightRadius: radius,
          borderBottomRightRadius: radius,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        style={styles.actionPress}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <FontAwesome name="trash" size={22} color="#000000" />
      </Pressable>
    </Animated.View>
  );
};

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
 *
 * The neumorphic shadow lives on the outer wrapper: the swipeable container
 * clips its children (so the actions stay rounded), and a clipped container
 * would also clip the shadow.
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
    <View
      style={[
        styles.shadow,
        { borderRadius: theme.borderRadius },
        raised(theme, 'sm'),
        style,
      ]}
    >
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={ACTION_WIDTH / 2}
        overshootRight={false}
        simultaneousWith={simultaneousWith}
        containerStyle={[
          styles.clip,
          {
            borderRadius: theme.borderRadius,
            backgroundColor: theme.surfaceColor,
          },
        ]}
        renderRightActions={(progress, _translation, methods) => (
          <DeleteAction
            progress={progress}
            radius={theme.borderRadius}
            accessibilityLabel={accessibilityLabel}
            onPress={() => {
              methods.close();
              onDelete();
            }}
          />
        )}
      >
        {children}
      </ReanimatedSwipeable>
    </View>
  );
};

export default SwipeToDelete;
