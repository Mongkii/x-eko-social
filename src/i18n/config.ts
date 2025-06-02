"use client"; // Ensure this runs on the client where localStorage/navigator is available

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

export const defaultNS = 'translation';

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      ns: [defaultNS],
      defaultNS: defaultNS,
      supportedLngs: supportedLanguages.map(lang => lang.code),
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie'],
        lookupLocalStorage: 'i18nextLngEko', // Custom localStorage key
      },
      interpolation: {
        escapeValue: false, // React already safes from xss
      },
      // React specific options
      react: {
        useSuspense: false, // Set to false to prevent useTranslation from suspending
      }
    });
}

export default i18n;
