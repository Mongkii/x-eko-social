
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
    notFound();
  }

  let messages: AbstractIntlMessages | undefined;
  try {
    messages = await getMessages({ locale });
    if (!messages || Object.keys(messages).length === 0) {
      console.warn(`LocaleLayout: No messages found for locale "${locale}", calling notFound(). This might be intended if i18n.ts called notFound().`);
      notFound();
    }
  } catch (error) {
    console.error(`LocaleLayout: Error fetching messages for locale "${locale}". Details:`, error);
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
