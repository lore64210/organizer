import { useRef, useEffect, useState } from 'react';
import {
  Text,
  Pressable,
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
import { glassSurface } from '../../utils/neumorphic';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      ...glassSurface(theme, theme.borderRadiusButton),
      position: 'absolute',
      right: 20,
      width: theme.buttonSize,
      height: theme.buttonSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.85,
    },
    labeledContainer: {
      width: 'auto',
      minWidth: theme.buttonSize,
    },
    button: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    labeledButton: {
      width: 'auto',
      flexDirection: 'row',
      paddingHorizontal: 14,
    },
    icon: {
      fontSize: 20,
    },
    label: {
      fontSize: 13,
      marginRight: 8,
      fontFamily: 'Montserrat_400Regular',
    },
  });

type IconName = ComponentProps<typeof FontAwesome>['name'];

type Props = {
  name: IconName;
  label?: string;
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
  label,
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
  const [pressed, setPressed] = useState(false);

  const showButtonsAnimation = useRef(new Animated.Value(initialPosition)).current;
  const opacityAnimation = useRef(new Animated.Value(showButton ? 1 : 0)).current;
  const hasLabel = !!label;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(showButtonsAnimation, {
        toValue: showButton ? position : initialPosition,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnimation, {
        toValue: showButton ? 1 : 0,
        duration: showButton ? 250 : 120,
        useNativeDriver: false,
      }),
    ]).start();
  }, [showButton, position, initialPosition, showButtonsAnimation, opacityAnimation]);

  const animatedContainerStyle = [
    styles.container,
    hasLabel && styles.labeledContainer,
    containerStyle,
    pressed && styles.pressed,
    horizontal ? { left: showButtonsAnimation } : { bottom: showButtonsAnimation },
    { opacity: opacityAnimation },
  ];

  const iconColor = color ?? theme.accentColor;
  const labelColor = color ?? theme.textColor;

  return (
    <Animated.View
      style={animatedContainerStyle}
      pointerEvents={showButton ? 'auto' : 'none'}
    >
      <Pressable
        style={[styles.button, hasLabel && styles.labeledButton]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {hasLabel ? (
          <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
        <FontAwesome
          style={[styles.icon, style]}
          name={name}
          color={iconColor}
          size={size}
        />
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedIconButton;
