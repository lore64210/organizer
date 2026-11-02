import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../config/redux/hooks';
import { CHANGE_THEME } from '../../config/redux/actions';
import { darkTheme, ligthTheme } from '../../config/theme';
import { DEFAULT_HEADER_HEIGHT, HeaderHeightProvider } from '../../providers/HeaderHeightContext';
import Header from './Header';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

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
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const washOpacity = useRef(new Animated.Value(0)).current;
  const animatingRef = useRef(false);
  const [animating, setAnimating] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [washColor, setWashColor] = useState(theme.backgroundColor);

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && Math.abs(layoutHeight - headerHeight) > 0.5) {
      setHeaderHeight(layoutHeight);
    }
  };

  /**
   * Crossfade: the content dims (but stays visible), the palette swaps at the
   * midpoint and the content fades back in. Only opacity is animated, so it
   * runs on the native driver and the same code works on web and native.
   */
  const changeTheme = () => {
    if (animatingRef.current) {
      return;
    }
    animatingRef.current = true;
    setAnimating(true);

    const nextIsDark = !isDarkTheme;
    setWashColor(nextIsDark ? darkTheme.backgroundColor : ligthTheme.backgroundColor);
    contentOpacity.setValue(1);
    washOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0.5,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(washOpacity, {
        toValue: 0.3,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        contentOpacity.setValue(1);
        washOpacity.setValue(0);
        animatingRef.current = false;
        setAnimating(false);
        return;
      }

      dispatch({ type: CHANGE_THEME, payload: nextIsDark });

      // Let React commit the new palette before starting the fade back in.
      // Otherwise the JS re-render competes with the animation and it looks
      // like a stutter.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 240,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(washOpacity, {
              toValue: 0,
              duration: 240,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start(() => {
            contentOpacity.setValue(1);
            washOpacity.setValue(0);
            animatingRef.current = false;
            setAnimating(false);
          });
        });
      });
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundColor },
        // Web stack scenes grow with their content; pin the screen to the
        // viewport so the list scrolls under the fixed header.
        Platform.OS === 'web'
          ? { height, flexGrow: 0, flexShrink: 0, flexBasis: 'auto' }
          : null,
      ]}
      pointerEvents={animating ? 'none' : 'auto'}
    >
      <Animated.View
        style={[styles.content, { paddingTop: insets.top, opacity: contentOpacity }]}
      >
        <HeaderHeightProvider value={headerHeight}>{children}</HeaderHeightProvider>
      </Animated.View>

      <Animated.View
        style={[styles.headerLayer, { top: insets.top, opacity: contentOpacity }]}
        onLayout={onHeaderLayout}
      >
        <Header {...headerProps} onThemePress={changeTheme} />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: washColor,
            opacity: washOpacity,
            zIndex: 30,
          },
        ]}
      />
    </Animated.View>
  );
};

export default Layout;
