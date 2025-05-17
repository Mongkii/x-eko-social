
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import enMessages from './messages/en.json'; // Static import for default locale

export const defaultLocale = 'en';
export const locales = [defaultLocale]; // Only English for now

// Minimal configuration for English-only setup
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Invalid locale "${locale}" requested. Falling back to notFound().`);
    notFound();
  }

  // For English, we use the statically imported messages.
  // For a multi-language setup, you'd use dynamic imports here for other locales.
  if (locale === 'en') {
    if (typeof enMessages === 'object' && enMessages !== null) {
      return {messages: enMessages};
    } else {
      console.error(`i18n.ts: Failed to load static en.json or it's not an object. Content:`, enMessages);
      // Fallback to minimal messages if static import failed or was not an object
      return {
        messages: {
          Global: { appName: "Shopyme (Minimal Fallback)" },
          HomePage: { greeting: "Welcome (Minimal Fallback)" },
        }
      };
    }
  }
  
  // Should not be reached if locales only contains 'en'
  // and the above check handles 'en'.
  // But as a safeguard for future expansion:
  console.warn(`i18n.ts: Locale "${locale}" not explicitly handled, returning minimal fallback.`);
  return {
    messages: {
      Global: { appName: "Shopyme (Minimal Fallback)" },
      HomePage: { greeting: "Welcome (Minimal Fallback)" },
    }
  };
});
