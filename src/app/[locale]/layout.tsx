
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FontSizeProvider } from '@/contexts/font-size-context';

interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  let messages: AbstractIntlMessages | undefined;
  try {
    // getMessages will either return messages or propagate a notFound() error from i18n.ts
    messages = await getMessages({ locale });
    
    // This check is a safeguard, but i18n.ts should ideally call notFound()
    // if messages are truly missing/invalid for a supported locale.
    if (!messages || Object.keys(messages).length === 0) {
       console.warn(`LocaleLayout: getMessages for locale "${locale}" returned empty or invalid messages. This might indicate an issue with the message file or i18n.ts fallback logic. Triggering notFound as a precaution.`);
       notFound();
    }
  } catch (error) {
    // This catch block handles errors propagated from getMessages (e.g., if i18n.ts called notFound()).
    // Or, if getMessages itself had an unexpected issue.
    console.error(`LocaleLayout: Error fetching messages for locale "${locale}". Details:`, error);
    // If getMessages calls notFound(), it will propagate and Next.js handles it.
    // If it's another type of error, we'll treat it as not found for safety.
    notFound(); 
  }

  // The <html> and <body> tags are in src/app/layout.tsx (RootLayout)
  // ThemeProvider is also in RootLayout, as is the Toaster
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <FontSizeProvider>
        {children}
      </FontSizeProvider>
    </NextIntlClientProvider>
  );
}
