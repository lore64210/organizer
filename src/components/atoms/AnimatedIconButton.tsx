import { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.primaryColor,
      borderRadius: theme.borderRadiusButton,
      position: 'absolute',
      right: 20,
      width: theme.buttonSize,
      height: theme.buttonSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.backgroundColor,
    },
    button: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 20,
    },
  });

type IconName = ComponentProps<typeof FontAwesome>['name'];

type Props = {
  name: IconName;
  color?: string;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  position?: number;
  initialPosition?: number;
  showButton?: boolean;
  horizontal?: boolean;
  accessibilityLabel?: string;
};

const AnimatedIconButton = ({
  name,
  color,
  size = 30,
  onPress,
  onLongPress,
  style,
  containerStyle,
  position = 20,
  initialPosition = 20,
  showButton = false,
  horizontal = false,
  accessibilityLabel,
}: Props) => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);

  const showButtonsAnimation = useRef(new Animated.Value(initialPosition)).current;

  useEffect(() => {
    Animated.timing(showButtonsAnimation, {
      toValue: showButton ? position : initialPosition,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showButton, position, initialPosition, showButtonsAnimation]);

  const animatedContainerStyle = horizontal
    ? [styles.container, containerStyle, { left: showButtonsAnimation }]
    : [styles.container, containerStyle, { bottom: showButtonsAnimation }];

  return (
    <Animated.View style={animatedContainerStyle}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <FontAwesome
          style={[styles.icon, style]}
          name={name}
          color={color ?? theme.textColor}
          size={size}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedIconButton;
