
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, ultimateFallbackMessages as i18nUltimateFallbackMessages } from '@/i18n'; // Import ultimateFallbackMessages
import { ThemeProvider } from "@/components/theme-provider"; // Keep ThemeProvider if it's locale-specific or if RootLayout doesn't have it
import { FontSizeProvider } from '@/contexts/font-size-context';
import { Toaster } from "@/components/ui/toaster"; // Keep Toaster if it's locale-specific

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
  
  // Validate locale from params early
  if (!locales.includes(locale as Locale)) {
    console.warn(`LocaleLayout: Locale "${locale}" from params is not in defined locales. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages | undefined;
  try {
    // getMessages will now use the super-simplified config from i18n.ts
    messages = await getMessages({ locale });
    
    // Check if messages are substantially empty or only the core fallback from i18n.ts
    // This indicates an issue with loading the specific locale's messages.
    if (!messages || Object.keys(messages).length === 0 || 
        (Object.keys(messages).length === 1 && messages.Global && Object.keys(messages.Global).length === 1 && (messages.Global as any).appName === "Eko (Core Fallback)")
       ) {
      // If getMessages returns the minimalCoreMessages (or empty), we use the comprehensive fallback for the client
      console.warn(`LocaleLayout: Messages from getMessages for locale "${locale}" were minimal or empty. Using comprehensive ultimateFallbackMessages for NextIntlClientProvider.`);
      messages = i18nUltimateFallbackMessages; // Use the imported comprehensive fallback
    } else {
      console.log(`LocaleLayout: Successfully received messages from getMessages for locale "${locale}".`);
    }
  } catch (error) {
    console.error(`LocaleLayout: Error calling getMessages for locale "${locale}". Using comprehensive ultimateFallbackMessages. Details:`, error);
    // Fallback to a comprehensive message set if getMessages fails catastrophically
    messages = i18nUltimateFallbackMessages; 
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* ThemeProvider and FontSizeProvider are now in RootLayout */}
      {children}
    </NextIntlClientProvider>
  );
}
