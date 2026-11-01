import { StyleSheet } from 'react-native';
import type { Theme } from '../../config/types';

/** Shared look for every modal/dialog in the app. */
export const createModalStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.primaryColor,
      borderRadius: theme.borderRadiusLarge,
      borderCurve: 'continuous',
      padding: 22,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.32,
      shadowRadius: 30,
      elevation: 18,
    },
    title: {
      color: theme.textColor,
      fontSize: 19,
      fontFamily: 'Montserrat_700Bold',
      marginBottom: 10,
    },
    message: {
      color: theme.textColor,
      opacity: 0.82,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Montserrat_400Regular',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
      marginTop: 20,
    },
  });
