
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {AbstractIntlMessages} from 'next-intl';

// V1 Scope: English and Arabic
export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Import English messages statically to ensure they are always available
// and to serve as the structure for the ultimate fallback.
import enMessages from './messages/en.json';

// This is the ultimate fallback, derived from en.json, ensuring a complete structure.
export const i18nUltimateFallbackMessages: AbstractIntlMessages = JSON.parse(JSON.stringify(enMessages));

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested in getRequestConfig. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;

  if (locale === defaultLocale) {
    // For the default locale (en), try to use the statically imported messages first.
    if (typeof enMessages === 'object' && enMessages !== null && Object.keys(enMessages).length > 0) {
      messages = enMessages;
    } else {
      console.error(`i18n.ts: CRITICAL - Statically imported 'enMessages' from './messages/en.json' are invalid or empty. Using i18nUltimateFallbackMessages.`);
      messages = i18nUltimateFallbackMessages;
    }
  } else {
    // For other locales, attempt dynamic import.
    try {
      const localeMessagesModule = await import(`./messages/${locale}.json`);
      messages = localeMessagesModule.default;

      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Using i18nUltimateFallbackMessages (English).`);
        messages = i18nUltimateFallbackMessages;
      }
    } catch (error) {
      console.error(`i18n.ts: Failed to load messages for locale "${locale}". Error:`, error, `Using i18nUltimateFallbackMessages (English).`);
      messages = i18nUltimateFallbackMessages;
    }
  }
  
  return {
    messages
  };
});
