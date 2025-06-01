
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Eko - Voice Social Network',
  description: 'Eko - The Voice-First Social Network. Share your voice with the world.',
  // Add more metadata specific to Eko: open graph, twitter cards, etc.
};

export const viewport: Viewport = {
  themeColor: [ // Adapt theme color for PWA
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' }, // Light theme primary color
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1A' },  // Dark theme primary color (Eko Dark Blue/Black)
  ],
  // Add PWA related viewport settings if Eko will be a PWA
  // initialScale: 1,
  // maximumScale: 1,
  // userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Eko might be dark by default
          enableSystem
          disableTransitionOnChange
        >
          <FontSizeProvider>
            {children}
            <Toaster />
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
