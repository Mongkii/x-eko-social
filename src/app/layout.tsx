
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale } from '@/i18n'; 

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shopyme',
  description: 'Personalized Ad Feed Experience',
};

// Minimal fallback messages for RootLayout if getMessages fails
// This is a last resort and should contain keys for essential UI elements
// that might be rendered even if full message loading fails.
const minimalFallbackMessages: AbstractIntlMessages = {
  Global: { appName: "Shopyme (Root FB)" },
  AppHeader: { shopyme: "Shopyme (Root FB)" },
  // Add other essential namespaces/keys if RootLayout or its direct children use them
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let messages: AbstractIntlMessages | undefined;
  try {
    messages = await getMessages({ locale: defaultLocale });
  } catch (error) {
    console.error("RootLayout: Failed to load messages, using minimal fallback. Error:", error);
    messages = minimalFallbackMessages; 
  }

  if (!messages || Object.keys(messages).length === 0) {
    console.warn("RootLayout: Messages object is empty or invalid after attempting to load/fallback. Using MINIMAL hardcoded fallback.");
    messages = minimalFallbackMessages;
  }


  return (
    <html lang={defaultLocale} className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        <NextIntlClientProvider locale={defaultLocale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
