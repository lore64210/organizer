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
    galleryWrapper: {
      position: 'absolute',
      left: 20,
      bottom: 0,
      width: 40,
      height: 40,
    },
    galleryButton: {
      position: 'relative',
      left: 0,
      right: 'auto',
      bottom: 0,
      width: 40,
      height: 40,
      backgroundColor: theme.backgroundColor,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: theme.textColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.primaryColor,
      fontSize: 10,
      fontFamily: 'Montserrat_700Bold',
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
  imageCount?: number;
  onImagesPress?: () => void;
};

const Header = ({ title, onTitlePress = () => {}, imageCount = 0, onImagesPress }: Props) => {
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
      {imageCount > 0 && onImagesPress ? (
        <View style={styles.galleryWrapper}>
          <IconButton
            onPress={onImagesPress}
            name="image"
            containerStyle={styles.galleryButton}
            color={isDarkTheme ? theme.textColor : theme.primaryColor}
            accessibilityLabel={i18n.t('viewImages')}
          />
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeText}>{imageCount}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default Header;
