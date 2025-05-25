
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

// Define the locales you want to support
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.warn(`Unsupported locale: ${locale}. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;
  try {
    const importedMessages = (await import(`./messages/${locale}.json`));
    // Handle cases where .default might not be present or the structure is unexpected
    messages = importedMessages.default || importedMessages;

    if (typeof messages !== 'object' || messages === null) {
        console.error(`Messages for locale "${locale}" are not a valid object. Content:`, messages);
        throw new Error(`Messages for locale "${locale}" are not a valid object.`);
    }

  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}". Error:`, error);
    // This will trigger the nearest not-found.tsx or error.tsx
    notFound();
  }
  
  return {
    messages
  };
});
