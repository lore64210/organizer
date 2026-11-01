import { View, Text, StyleSheet, Image } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useAppSelector } from '../../config/redux/hooks';
import { IconButton } from '../atoms';
import i18n from '../../config/i18n';
import type { Theme } from '../../config/types';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      backgroundImage: theme.headerBackground,
      alignItems: 'center',
      paddingBottom: 4,
    },
    title: {
      color: theme.accentColor,
      fontSize: 17,
      letterSpacing: 0.4,
      paddingBottom: 8,
      fontFamily: 'Montserrat_700Bold',
    },
    themeButton: {
      bottom: 12,
      width: 40,
      height: 40,
    },
    galleryWrapper: {
      position: 'absolute',
      left: 20,
      bottom: 12,
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
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: theme.accentColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.backgroundColor,
      fontSize: 10,
      fontFamily: 'Montserrat_700Bold',
    },
    logo: {
      width: 56,
      height: 56,
      marginTop: 12,
    },
  });

type Props = {
  title?: string;
  onTitlePress?: () => void;
  imageCount?: number;
  onImagesPress?: () => void;
  onThemePress?: (point: { x: number; y: number }) => void;
};

const Header = ({
  title,
  onTitlePress = () => {},
  imageCount = 0,
  onImagesPress,
  onThemePress,
}: Props) => {
  const { isDarkTheme, theme } = useAppSelector(state => state.themeReducer);
  const styles = createStyles(theme);

  const changeTheme = (event: GestureResponderEvent) => {
    // The circle grows from the point the user tapped.
    onThemePress?.({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
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
        color={theme.accentColor}
        accessibilityLabel={i18n.t(isDarkTheme ? 'switchToLight' : 'switchToDark')}
      />
      {imageCount > 0 && onImagesPress ? (
        <View style={styles.galleryWrapper}>
          <IconButton
            onPress={onImagesPress}
            name="image"
            containerStyle={styles.galleryButton}
            color={theme.accentColor}
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
