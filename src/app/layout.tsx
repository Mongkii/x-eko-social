
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { AuthProvider } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { FloatingCreateEkoButton } from '@/components/eko/FloatingCreateEkoButton';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { GlobalAudioPlayer } from '@/components/audio/GlobalAudioPlayer';
import { I18nInitializer } from '@/components/I18nInitializer'; // New i18next provider
import { DailyFullScreenAdManager } from '@/components/ads/DailyFullScreenAdManager'; // Ad manager

export const metadata: Metadata = {
  title: 'Eko - Voice Social Network', // This could be translated later if needed server-side
  description: 'Eko - The Voice-First Social Network. Share your voice with the world.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The lang and dir attributes will be set by I18nInitializer client-side
    <html className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FontSizeProvider>
              <AudioPlayerProvider>
                <I18nInitializer> {/* Wrap with i18next initializer */}
                  <DailyFullScreenAdManager /> {/* Ad manager added here */}
                  <div className="relative flex min-h-screen flex-col">
                    {children}
                    <GlobalAudioPlayer />
                  </div>
                  <FloatingCreateEkoButton />
                  <Toaster />
                </I18nInitializer>
              </AudioPlayerProvider>
            </FontSizeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
