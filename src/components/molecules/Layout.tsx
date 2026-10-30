import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useAppSelector } from '../../config/redux/hooks';
import { darkTheme, ligthTheme } from '../../config/theme';
import Header from './Header';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type Props = {
  children: ReactNode;
  headerProps?: {
    title?: string;
    onTitlePress?: () => void;
  };
};

const Layout = ({ children, headerProps }: Props) => {
  const { startThemeAnimation, isDarkTheme } = useAppSelector(state => state.themeReducer);
  const backgroundColor = useRef(new Animated.Value(1)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!startThemeAnimation) {
      return;
    }

    Animated.timing(backgroundColor, {
      toValue: isDarkTheme ? 0 : 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    Animated.sequence([
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [startThemeAnimation, isDarkTheme, backgroundColor, opacityAnimation]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnimation,
          backgroundColor: backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: [ligthTheme.backgroundColor, darkTheme.backgroundColor],
          }),
        },
      ]}
    >
      <Header {...headerProps} />
      {children}
    </Animated.View>
  );
};

export default Layout;
