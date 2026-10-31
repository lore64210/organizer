import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
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
  const { theme, startThemeAnimation, isDarkTheme, themeAnimationOrigin } = useAppSelector(
    state => state.themeReducer,
  );
  const { width, height } = useWindowDimensions();

  const circleScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const [circle, setCircle] = useState<Circle | null>(null);

  useEffect(() => {
    if (!startThemeAnimation) {
      setCircle(null);
      return;
    }

    const origin = themeAnimationOrigin ?? { x: width / 2, y: height / 2 };
    // Radius needed to cover the farthest corner from the tap point.
    const radius = Math.hypot(
      Math.max(origin.x, width - origin.x),
      Math.max(origin.y, height - origin.y),
    );

    circleScale.setValue(0);
    contentOpacity.setValue(1);
    setCircle({
      x: origin.x,
      y: origin.y,
      radius,
      color: isDarkTheme ? ligthTheme.backgroundColor : darkTheme.backgroundColor,
    });

    Animated.timing(circleScale, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }
      // The circle covers the whole screen: swap the palette underneath and reveal it.
      contentOpacity.setValue(0);
      dispatch({ type: CHANGE_THEME, payload: !isDarkTheme });
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    });
  }, [startThemeAnimation]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Animated.View
        style={[styles.content, { opacity: contentOpacity }]}
        pointerEvents={startThemeAnimation ? 'none' : 'auto'}
      >
        <Header {...headerProps} />
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
            transform: [{ scale: circleScale }],
          }}
        />
      ) : null}
    </Animated.View>
  );
};

export default Layout;
