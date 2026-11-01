const darkTheme = {
    // Texto e iconografía
    textColor: '#E9EEF4',
    mutedColor: '#8EA5BA',
    placeholderTextColor: '#7C93A8',
    accentColor: '#ECB365',

    // Superficies: fondo y tarjetas comparten color para que el relieve
    // lo den únicamente las sombras (neumorfismo).
    backgroundColor: '#071F35',
    primaryColor: '#071F35',
    surfaceColor: '#071F35',
    secondaryColor: '#041624',
    insetColor: '#041624',

    // Luces del relieve
    shadowLight: '#103A57',
    shadowDark: '#02101D',
    hairlineColor: 'rgba(255,255,255,0.08)',
    headerBackground:
        'linear-gradient(180deg, rgba(7,31,53,0.90) 0%, rgba(7,31,53,0.72) 50%, rgba(7,31,53,0.45) 85%, rgba(7,31,53,0) 100%)',

    // Capa flotante (glassmorphism)
    glassBackground: 'rgba(9,33,54,0.52)',
    glassBorder: 'rgba(255,255,255,0.16)',
    glassHighlight: 'rgba(255,255,255,0.22)',
    glassScrim: 'rgba(2,10,18,0.42)',
    glassShadow: 'rgba(0,0,0,0.55)',

    buttonSize: 50,
    borderRadius: 18,
    borderRadiusSmall: 12,
    borderRadiusLarge: 28,
    borderRadiusButton: 999,
    deleteButtonColor: '#B3363C',
}

const ligthTheme = {
    // Texto e iconografía
    textColor: '#16324A',
    mutedColor: '#5C7287',
    placeholderTextColor: '#5C7287',
    accentColor: '#2E5C7A',

    // Superficies unificadas
    backgroundColor: '#E6EBF1',
    primaryColor: '#E6EBF1',
    surfaceColor: '#E6EBF1',
    secondaryColor: '#DBE3EC',
    insetColor: '#DBE3EC',

    // Luces del relieve
    shadowLight: '#FFFFFF',
    shadowDark: '#C2CCD9',
    hairlineColor: 'rgba(22,50,74,0.08)',
    headerBackground:
        'linear-gradient(180deg, rgba(230,235,241,0.92) 0%, rgba(230,235,241,0.78) 50%, rgba(230,235,241,0.50) 85%, rgba(230,235,241,0) 100%)',

    // Capa flotante (glassmorphism)
    glassBackground: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.85)',
    glassHighlight: 'rgba(255,255,255,0.95)',
    glassScrim: 'rgba(22,50,74,0.28)',
    glassShadow: 'rgba(22,50,74,0.18)',

    buttonSize: 50,
    borderRadius: 18,
    borderRadiusSmall: 12,
    borderRadiusLarge: 28,
    borderRadiusButton: 999,
    deleteButtonColor: '#C2383F',
}

export {
    darkTheme,
    ligthTheme,
};

/** Background for swipe-to-delete actions (same red in both themes for contrast with the black icon). */
export const swipeActionColor = '#D53E43';
