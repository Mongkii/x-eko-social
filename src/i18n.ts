
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';
import enMessages from './messages/en.json'; // Static import for default locale

// Define the locales you want to support
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// This function is used by next-intl to load messages for the current request.
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;

  try {
    if (locale === defaultLocale) {
      // For the default locale (English), use the statically imported messages.
      // Ensure it's a valid object.
      if (typeof enMessages === 'object' && enMessages !== null) {
        messages = enMessages as AbstractIntlMessages;
      } else {
        console.error(`i18n.ts: Statically imported 'en.json' is not a valid object. Content:`, enMessages);
        throw new Error(`Statically imported 'en.json' is not a valid object.`);
      }
    } else {
      // For other locales, dynamically import the messages.
      const importedModule = await import(`./messages/${locale}.json`);
      let potentialMessages = importedModule.default || importedModule;

      if (typeof potentialMessages === 'string') {
        console.warn(`i18n.ts: Messages for locale "${locale}" were imported as a string. Attempting JSON.parse.`);
        try {
          potentialMessages = JSON.parse(potentialMessages);
        } catch (parseError) {
          console.error(`i18n.ts: Failed to parse JSON for locale "${locale}" after importing as string. Content snippet: ${(potentialMessages as string).substring(0, 100)}. Error:`, parseError);
          throw new Error(`Failed to parse JSON for locale "${locale}".`);
        }
      }

      if (typeof potentialMessages === 'object' && potentialMessages !== null) {
        messages = potentialMessages as AbstractIntlMessages;
      } else {
        console.error(`i18n.ts: Messages for locale "${locale}" are not a valid object after import/parse. Content:`, potentialMessages);
        throw new Error(`Messages for locale "${locale}" are not a valid object.`);
      }
    }

    if (Object.keys(messages).length === 0) {
      // This case should ideally be caught by the specific error handling above,
      // but as a final safeguard for empty (but validly parsed) JSON.
      console.warn(`i18n.ts: No messages found for locale "${locale}" after loading. This might indicate an empty JSON file. Calling notFound().`);
      notFound();
    }
    
  } catch (error) {
    console.error(`i18n.ts: Critical error loading messages for locale "${locale}". Details:`, error);
    // If messages for a supported locale cannot be loaded, it's a server error.
    // Triggering notFound() makes sense as the localized page isn't available.
    notFound();
  }
  
  return {
    messages
  };
});
