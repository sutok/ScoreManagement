import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationJA from './locales/ja/translation.json';
import translationEN from './locales/en/translation.json';
import translationFIL from './locales/fil/translation.json';
import translationID from './locales/id/translation.json';

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
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['ja', 'en', 'fil', 'id'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
