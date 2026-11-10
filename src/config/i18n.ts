import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { en, es } from './translations';

const i18n = new I18n({ en, es });

// Solo inglés y español: el resto de los idiomas cae en inglés por defecto.
const deviceLanguage = Localization.getLocales()[0]?.languageCode;

i18n.defaultLocale = 'en';
i18n.locale = deviceLanguage === 'es' ? 'es' : 'en';
i18n.enableFallback = true;

export default i18n;
