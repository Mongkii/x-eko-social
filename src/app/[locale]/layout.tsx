
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, i18nUltimateFallbackMessages, defaultLocale as i18nDefaultLocale } from '@/i18n';

// This component does NOT render <html> or <body>.
// That's handled by src/app/layout.tsx (RootLayout).
// This LocaleLayout is specific to the [locale] segment and primarily sets up i18n.

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  // Validate that the incoming `locale` parameter is a valid locale
  // Type assertion 'as any' is used because `locales` is `readonly ['en', ...]`
  if (!locales.includes(locale as any)) {
    console.warn(`LocaleLayout: Invalid locale "${locale}" requested from URL params. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;
  try {
    // getMessages will use the configuration from src/i18n.ts
    // src/i18n.ts is configured to return i18nUltimateFallbackMessages (English)
    // if the specific locale's messages cannot be loaded or are invalid, or if i18n.ts itself calls notFound.
    messages = await getMessages({ locale });

    if (!messages || Object.keys(messages).length === 0) {
      console.error(`LocaleLayout: CRITICAL - Messages for locale "${locale}" are unexpectedly empty even after i18n.ts fallbacks. This indicates a severe issue with i18n.ts or getMessages. Forcing notFound.`);
      notFound();
    }
    
    // Check if we are using the ultimate fallback for a non-default locale,
    // which might indicate the specific locale's message file is missing or corrupt.
    const isUsingUltimateFallback = messages.Global?.appName === i18nUltimateFallbackMessages.Global?.appName;
    if (locale !== i18nDefaultLocale && isUsingUltimateFallback) {
        console.warn(`LocaleLayout: Locale "${locale}" is using the ultimate English fallback messages from i18n.ts. Its specific message file might be missing or corrupt.`);
    }

  } catch (error) {
    // This catch block will primarily catch errors if getMessages itself throws something
    // other than the error propagated by notFound() from i18n.ts.
    // If i18n.ts called notFound(), that error should ideally be handled by Next.js directly.
    console.error(`LocaleLayout: Error calling getMessages for locale "${locale}". This indicates a severe issue with next-intl setup or i18n.ts. Propagating notFound. Details:`, error);
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Global providers like ThemeProvider, FontSizeProvider, and Toaster 
          are expected to be in src/app/layout.tsx (RootLayout) wrapping this LocaleLayout's children.
      */}
      {children}
    </NextIntlClientProvider>
  );
}
