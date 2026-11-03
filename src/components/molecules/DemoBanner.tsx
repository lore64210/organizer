import { Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import i18n from '../../config/i18n';
import { DEMO_MODE } from '../../config/demo';
import { useAppSelector } from '../../config/redux/hooks';
import type { Theme } from '../../config/types';

const INSTALL_URL = 'https://github.com/lore64210/organizer/releases/latest';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pill: {
      position: 'absolute',
      left: 16,
      bottom: 18,
      zIndex: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.borderRadiusButton,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      backgroundColor: theme.glassBackground,
      shadowColor: theme.glassShadow,
      shadowOpacity: 0.45,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    text: {
      color: theme.textColor,
      fontSize: 9,
      letterSpacing: 0.6,
      fontFamily: 'Montserrat_700Bold',
    },
  });

const DemoBanner = () => {
  const theme = useAppSelector(state => state.themeReducer.theme);
  const styles = createStyles(theme);

  const isEmbedded =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('embedded') === '1';

  if (!DEMO_MODE || isEmbedded) {
    return null;
  }

  const isEnglish = i18n.locale.toLowerCase().startsWith('en');
  const label = isEnglish ? 'WEB DEMO · GET THE APP' : 'DEMO WEB · DESCARGAR APP';

  return (
    <Pressable
      onPress={() => Linking.openURL(INSTALL_URL)}
      style={styles.pill}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <FontAwesome name="android" size={12} color={theme.accentColor} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

export default DemoBanner;
