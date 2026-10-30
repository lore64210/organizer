import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { en, es } from './translations';

const i18n = new I18n({ en, es });

i18n.defaultLocale = 'en';
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

export default i18n;
