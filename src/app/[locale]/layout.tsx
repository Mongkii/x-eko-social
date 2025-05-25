
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server'; // Corrected import for getMessages
import { notFound } from 'next/navigation';
import { FontSizeProvider } from '@/contexts/font-size-context'; // Import FontSizeProvider

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
    messages = await getMessages({ locale });
    // The check for !messages or empty messages can be here,
    // but i18n.ts should ideally call notFound() if messages are truly missing/invalid for a supported locale.
    if (!messages || Object.keys(messages).length === 0) {
       console.warn(`LocaleLayout: getMessages for locale "${locale}" returned empty or invalid messages. This might indicate an issue with the message file or i18n.ts fallback logic.`);
       // Depending on strictness, you might call notFound() here too.
       // For now, let's assume i18n.ts handles critical "not found" scenarios.
       // If i18n.ts provides an empty object as a last resort, we proceed with that.
    }
  } catch (error) {
    console.error(`Error fetching messages for locale "${locale}" in LocaleLayout. Details:`, error);
    // If getMessages calls notFound() (e.g., due to i18n.ts calling it for an unsupported locale
    // or critical message loading failure), it will propagate and Next.js handles it.
    // If it's another type of error, we'll treat it as not found.
    notFound(); 
  }

  // This check is a final safety net. If messages are still undefined here,
  // it means the error handling above or in i18n.ts didn't result in a notFound() call
  // for a situation where messages are truly unavailable.
  if (!messages) {
    console.error(`LocaleLayout: Messages object for locale "${locale}" is undefined after try-catch. Triggering notFound.`);
    notFound();
  }
  
  // The <html> and <body> tags are in src/app/layout.tsx (RootLayout)
  // ThemeProvider is also in RootLayout
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <FontSizeProvider>
        {children}
      </FontSizeProvider>
    </NextIntlClientProvider>
  );
}
