
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { defaultLocale } from '@/i18n'; // Assuming defaultLocale is 'en'

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

// Drastically simplified fallback messages for diagnostics
const minimalFallbackMessages: AbstractIntlMessages = {
  FeedItemCard: {
    adBadge: 'Ad (FB)',
    sponsoredBy: 'Sponsored by (FB)',
    categoriesLabel: 'Categories (FB)',
    rateThisAdLabel: 'Rate this ad (FB)',
    rateThisContentLabel: 'Rate this content (FB)',
    dislikeAction: 'Dislike (FB)',
    likeAction: 'Like (FB)',
    commentAction: 'Comment (FB)',
    shareAction: 'Share (FB)',
    shareOnFacebook: "Share on Facebook (FB)",
    shareOnTwitter: "Share on Twitter (FB)",
    shareOnInstagram: "Share on Instagram (FB)",
    // Add any other keys directly used by FeedItemCard if necessary for it to render
  },
  // Add other essential namespaces if other components in the immediate tree also break
  Global: { appName: 'Shopyme (FB)' },
  HomePage: { greeting: 'Welcome (FB)'}, // Example
  AppHeader: { shopyme: "Shopyme (FB)", savedAdsTooltip: 'Saved Ads (FB)', personalizeFeedTooltip: 'Personalize (FB)'}, // Example
  ThemeToggleSwitch: {switchToLightTheme: "Light (FB)", switchToDarkTheme: "Dark (FB)"}
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("RootLayout: Using MINIMAL hardcoded fallback messages for NextIntlClientProvider.");

  return (
    <html lang={defaultLocale} className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        <NextIntlClientProvider locale={defaultLocale} messages={minimalFallbackMessages}>
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
