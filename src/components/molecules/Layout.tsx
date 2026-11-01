import { useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../config/redux/hooks';
import { CHANGE_THEME } from '../../config/redux/actions';
import { darkTheme, ligthTheme } from '../../config/theme';
import Header from './Header';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

type Circle = {
  x: number;
  y: number;
  radius: number;
  color: string;
};

type Props = {
  children: ReactNode;
  headerProps?: {
    title?: string;
    onTitlePress?: () => void;
    imageCount?: number;
    onImagesPress?: () => void;
  };
};

const Layout = ({ children, headerProps }: Props) => {
  const dispatch = useAppDispatch();
  const { theme, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(1)).current;
  const animatingRef = useRef(false);
  const [animating, setAnimating] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);

  const changeTheme = (point: { x: number; y: number }) => {
    if (animatingRef.current) {
      return;
    }
    animatingRef.current = true;
    setAnimating(true);

    // Radius needed to cover the farthest corner from the tap point.
    const radius = Math.hypot(
      Math.max(point.x, width - point.x),
      Math.max(point.y, height - point.y),
    );

    circleScale.setValue(0);
    circleOpacity.setValue(1);
    setCircle({
      x: point.x,
      y: point.y,
      radius,
      color: isDarkTheme ? ligthTheme.backgroundColor : darkTheme.backgroundColor,
    });

    Animated.timing(circleScale, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        animatingRef.current = false;
        setAnimating(false);
        setCircle(null);
        return;
      }

      // The circle covers the screen: the palette is already swapped underneath,
      // so we only fade the circle out instead of the content (fading the content
      // would make cards translucent and reveal the swipe actions behind them).
      dispatch({ type: CHANGE_THEME, payload: !isDarkTheme });
      Animated.timing(circleOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        animatingRef.current = false;
        setAnimating(false);
        setCircle(null);
      });
    });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Animated.View
        style={[styles.content, { paddingTop: insets.top }]}
        pointerEvents={animating ? 'none' : 'auto'}
      >
        <Header {...headerProps} onThemePress={changeTheme} />
        {children}
      </Animated.View>

      {circle ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: circle.x - circle.radius,
            top: circle.y - circle.radius,
            width: circle.radius * 2,
            height: circle.radius * 2,
            borderRadius: circle.radius,
            backgroundColor: circle.color,
            opacity: circleOpacity,
            transform: [{ scale: circleScale }],
          }}
        />
      ) : null}
    </Animated.View>
  );
};

export default Layout;
