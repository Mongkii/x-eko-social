
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages, टाइमस्टamped } from '@/i18n'; // Assuming getMessages is async
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
  } catch (error) {
    console.error(`Error fetching messages for locale "${locale}" in LocaleLayout. Details:`, error);
    // If getMessages calls notFound() or throws an error that isn't caught by i18n.ts's internal fallbacks
    notFound(); 
  }

  if (!messages) {
    // This case should ideally be handled by getMessages calling notFound()
    // or src/i18n.ts providing a fallback. If it still reaches here, treat as not found.
    console.error(`LocaleLayout: Messages object for locale "${locale}" is undefined. Triggering notFound.`);
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
