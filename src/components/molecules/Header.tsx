import { View, Text, StyleSheet, Image } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../config/redux/hooks';
import { CHANGE_THEME, START_THEME_ANIMATION } from '../../config/redux/actions';
import { IconButton } from '../atoms';
import i18n from '../../config/i18n';
import type { Theme } from '../../config/types';

const createStyles = (theme: Theme, isDarkTheme: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundColor,
      alignItems: 'center',
      borderBottomColor: isDarkTheme ? theme.secondaryColor : theme.primaryColor,
      borderBottomWidth: 5,
    },
    title: {
      color: isDarkTheme ? theme.textColor : theme.primaryColor,
      fontSize: 18,
      paddingBottom: 5,
      fontFamily: 'Montserrat_700Bold',
    },
    themeButton: {
      bottom: 0,
      backgroundColor: theme.backgroundColor,
      width: 40,
      height: 40,
    },
    logo: {
      width: 75,
      height: 75,
      marginTop: 10,
    },
  });

type Props = {
  title?: string;
  onTitlePress?: () => void;
};

const Header = ({ title, onTitlePress = () => {} }: Props) => {
  const dispatch = useAppDispatch();
  const { isDarkTheme, theme } = useAppSelector(state => state.themeReducer);
  const styles = createStyles(theme, isDarkTheme);

  const changeTheme = () => {
    dispatch({ type: START_THEME_ANIMATION });
    setTimeout(() => dispatch({ type: CHANGE_THEME, payload: !isDarkTheme }), 225);
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={
          isDarkTheme
            ? require('../../../assets/adaptive-icon.png')
            : require('../../../assets/adaptive-icon-light.png')
        }
      />
      <Text onPress={onTitlePress} style={styles.title}>
        {title}
      </Text>
      <IconButton
        onPress={changeTheme}
        name={isDarkTheme ? 'moon-o' : 'sun-o'}
        containerStyle={styles.themeButton}
        color={isDarkTheme ? theme.textColor : theme.primaryColor}
        accessibilityLabel={i18n.t(isDarkTheme ? 'switchToLight' : 'switchToDark')}
      />
    </View>
  );
};

export default Header;
