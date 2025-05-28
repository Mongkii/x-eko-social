
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, i18nUltimateFallbackMessages } from '@/i18n'; // Import i18nUltimateFallbackMessages
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { Toaster } from "@/components/ui/toaster";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  
  // Validate that the incoming `locale` parameter is valid.
  // i18n.ts should also call notFound() if locale is invalid during getRequestConfig.
  if (!locales.includes(locale as Locale)) {
    console.warn(`LocaleLayout: Locale "${locale}" from params is not defined in src/i18n.ts. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;
  try {
    // getMessages will now use the robust configuration from i18n.ts,
    // which should always return a comprehensive (English fallback if needed) messages object.
    messages = await getMessages({ locale });
    
    if (!messages || Object.keys(messages).length === 0) {
      console.error(`LocaleLayout: CRITICAL - getMessages for locale "${locale}" returned empty or invalid messages. This should be prevented by i18n.ts fallbacks. Propagating notFound().`);
      notFound();
    } else if (
      locale !== 'en' && 
      messages.Global && 
      (messages.Global as any).appName === i18nUltimateFallbackMessages.Global.appName 
      // Add more checks if needed to confirm it's the fallback, e.g., a specific fallback marker
    ) {
      console.warn(`LocaleLayout: Locale "${locale}" is using English fallback messages from i18n.ts. Translation for "${locale}" might be missing or incomplete.`);
    }

  } catch (error) {
    // This catch block will be hit if getMessages propagates an error (e.g., from notFound() in i18n.ts)
    console.error(`LocaleLayout: Error calling getMessages for locale "${locale}". Details:`, error);
    // If getMessages itself throws (e.g. due to notFound() in i18n.ts for an invalid locale path),
    // propagate notFound() to render the Not Found page.
    notFound();
  }
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* ThemeProvider and FontSizeProvider are now in RootLayout, so not needed here if RootLayout is the true root. 
          However, if [locale] is the top-most segment where these contexts are needed, keep them.
          Based on typical Next.js App Router, these might be better in RootLayout.
          Assuming RootLayout provides ThemeProvider, FontSizeProvider and Toaster globally.
          If not, they should be here. For Eko BRD, we kept them in RootLayout.
          For Ameenee, let's assume they are global, and this LocaleLayout just adds NextIntl.
      */}
      {/* The html and body tags are in src/app/layout.tsx. */}
      {/* The dir attribute is set on the html tag by next-intl based on locale. */}
      {children}
    </NextIntlClientProvider>
  );
}
