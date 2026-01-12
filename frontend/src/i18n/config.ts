import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationJA from './locales/ja/translation.json';
import translationEN from './locales/en/translation.json';
import translationFIL from './locales/fil/translation.json';
import translationID from './locales/id/translation.json';
import translationTH from './locales/th/translation.json';
import translationVI from './locales/vi/translation.json';

const resources = {
  ja: {
    translation: translationJA
  },
  en: {
    translation: translationEN
  },
  fil: {
    translation: translationFIL
  },
  id: {
    translation: translationID
  },
  th: {
    translation: translationTH
  },
  vi: {
    translation: translationVI
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['ja', 'en', 'fil', 'id', 'th', 'vi'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
