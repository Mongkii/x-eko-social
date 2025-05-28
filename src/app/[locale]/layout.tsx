
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/i18n';

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
  
  if (!locales.includes(locale as Locale)) {
    console.warn(`LocaleLayout: Locale "${locale}" from params is not defined in src/i18n.ts. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;
  try {
    messages = await getMessages({ locale });
    if (!messages || Object.keys(messages).length === 0) {
      console.error(`LocaleLayout: CRITICAL - Messages for locale "${locale}" are empty even after i18n.ts fallbacks. This should not happen if i18n.ts calls notFound() for missing/corrupt files. Propagating notFound().`);
      notFound();
    }
  } catch (error) {
    console.error(`LocaleLayout: Error calling getMessages for locale "${locale}". This likely means i18n.ts called notFound(). Propagating notFound(). Details:`, error);
    notFound();
  }
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* The html and body tags are in src/app/layout.tsx. ThemeProvider is also there. */}
      {/* The dir attribute is set on the html tag by next-intl based on locale. */}
        {children}
    </NextIntlClientProvider>
  );
}
