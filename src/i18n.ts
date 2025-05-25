
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';
import enMessages from './messages/en.json'; // Static import for default locale

// Define the locales you want to support
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// A minimal set of messages to ensure next-intl initializes if all else fails.
const ultimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko (Ultimate Fallback)"
  },
  HomePage: {
    greeting: "Welcome (Ultimate Fallback)"
  },
  AppHeader: {
    appName: "Eko (Ultimate Fallback)"
  },
  FeedItemCard: {
    adBadge: "Ad (Ultimate Fallback)"
  }
};

// This function is used by next-intl to load messages for the current request.
export default getRequestConfig(async ({locale}: {locale: string}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;

  try {
    if (locale === defaultLocale) {
      // For the default locale (English), use the statically imported messages.
      if (typeof enMessages === 'object' && enMessages !== null && Object.keys(enMessages).length > 0) {
        messages = enMessages as AbstractIntlMessages;
        // console.log(`i18n.ts: Successfully used statically imported 'en.json' for locale "${locale}".`);
      } else {
        console.error(`i18n.ts: Statically imported 'en.json' is not a valid or non-empty object for locale "${locale}". Using ultimate fallback. Content:`, enMessages);
        messages = ultimateFallbackMessages;
      }
    } else {
      // For other locales, dynamically import the messages.
      const importedModule = await import(`./messages/${locale}.json`);
      let potentialMessages = importedModule.default || importedModule;

      if (typeof potentialMessages === 'string') {
        // console.warn(`i18n.ts: Messages for locale "${locale}" were imported as a string. Attempting JSON.parse.`);
        try {
          potentialMessages = JSON.parse(potentialMessages);
        } catch (parseError) {
          console.error(`i18n.ts: Failed to parse JSON for locale "${locale}" after importing as string. Content snippet: ${(potentialMessages as string).substring(0, 100)}. Using ultimate fallback. Error:`, parseError);
          messages = ultimateFallbackMessages;
          // Potentially call notFound() here if you prefer a 404 for broken non-default locales.
          // For now, we return ultimate fallback to prevent "config not found".
          // notFound(); 
          return { messages }; // Return here with fallback
        }
      }

      if (typeof potentialMessages === 'object' && potentialMessages !== null && Object.keys(potentialMessages).length > 0) {
        messages = potentialMessages as AbstractIntlMessages;
        // console.log(`i18n.ts: Successfully loaded messages for locale "${locale}".`);
      } else {
        console.error(`i18n.ts: Messages for locale "${locale}" are not a valid or non-empty object after import/parse. Using ultimate fallback. Content:`, potentialMessages);
        messages = ultimateFallbackMessages;
        // Potentially call notFound() here.
        // notFound();
        return { messages }; // Return here with fallback
      }
    }
  } catch (error) {
    console.error(`i18n.ts: Critical error loading messages for locale "${locale}". Using ultimate fallback. Details:`, error);
    messages = ultimateFallbackMessages;
    // Potentially call notFound() here to make the route 404.
    // For now, return ultimate fallback to satisfy getMessages.
    // notFound();
  }
  
  return {
    messages
  };
});
