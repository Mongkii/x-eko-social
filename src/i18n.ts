
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

// Define the locales you want to support
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// A very minimal set of messages for next-intl's core server-side initialization.
// This MUST be a valid AbstractIntlMessages structure.
const minimalCoreMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko (Core Fallback)"
  }
  // Add other top-level namespaces if next-intl's core/middleware strictly requires them.
  // For instance, if your components always try to load 'HomePage', you might need:
  // HomePage: {
  //   greeting: "Welcome (Core Fallback)"
  // }
};

export default getRequestConfig(async ({locale}: {locale: string}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested for getRequestConfig. Calling notFound().`);
    notFound();
  }

  // For this diagnostic step, always return the minimal core messages
  // regardless of the actual locale. This ensures next-intl's getMessages
  // always receives a valid, albeit minimal, configuration.
  console.log(`i18n.ts: Providing minimalCoreMessages for locale "${locale}" to satisfy next-intl core.`);
  return {
    messages: minimalCoreMessages
  };
});

// Export types for use in other parts of the application
export type Messages = AbstractIntlMessages;
