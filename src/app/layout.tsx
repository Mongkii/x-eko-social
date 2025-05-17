
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { defaultLocale, minimalFallbackMessages } from '@/i18n'; // Import from i18n.ts

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

// This RootLayout is a Server Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // For a single-language app (English only),
  // directly use the imported minimalFallbackMessages and defaultLocale.
  // This avoids calling getMessages() at the root, which was causing issues.
  const messages = minimalFallbackMessages;
  const locale = defaultLocale;
  console.log("RootLayout: Using MINIMAL hardcoded fallback messages imported from i18n.ts for NextIntlClientProvider.");

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
