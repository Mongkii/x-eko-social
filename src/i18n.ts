
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import enMessages from './messages/en.json'; // Static import for default locale

export const defaultLocale = 'en';
export const locales = [defaultLocale]; // Only English for now

// Minimal fallback messages for i18n.ts itself
// These keys should match what your components are trying to access.
const ultimateFallbackMessages = {
  Global: { appName: "Shopyme (i18n Fallback)" },
  HomePage: { greeting: "Welcome (i18n Fallback)" },
  AppHeader: { shopyme: "Shopyme (i18n Fallback)" },
  FeedItemCard: { adBadge: "Ad (i18n Fallback)"},
  ThemeToggleSwitch: {switchToLightTheme: "Light Mode (i18n Fallback)"},
  // Add other essential namespaces/keys if needed
};

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Invalid locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  if (locale === 'en') {
    if (typeof enMessages === 'object' && enMessages !== null && Object.keys(enMessages).length > 0) {
      return {messages: enMessages};
    } else {
      console.error(`i18n.ts: Failed to load static en.json or it's empty/invalid. Using ultimate fallback. Content:`, enMessages);
      return {messages: ultimateFallbackMessages };
    }
  }
  
  // Fallback for any other case (though should not be reached with current locales setup)
  console.warn(`i18n.ts: Locale "${locale}" not explicitly handled or en.json failed, returning ultimate fallback.`);
  return {messages: ultimateFallbackMessages };
});

