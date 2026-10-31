import { useRef, useEffect } from 'react';
import {
  Text,
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
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
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
    horizontal ? { left: showButtonsAnimation } : { bottom: showButtonsAnimation },
    { opacity: opacityAnimation },
  ];

  const iconColor = color ?? theme.textColor;

  return (
    <Animated.View
      style={animatedContainerStyle}
      pointerEvents={showButton ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={[styles.button, hasLabel && styles.labeledButton]}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {hasLabel ? (
          <Text style={[styles.label, { color: iconColor }]} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
        <FontAwesome
          style={[styles.icon, style]}
          name={name}
          color={iconColor}
          size={size}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedIconButton;
