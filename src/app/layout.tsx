
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { AuthProvider } from '@/contexts/auth-context'; // Import AuthProvider
import { cn } from '@/lib/utils';
import { FloatingCreateEkoButton } from '@/components/eko/FloatingCreateEkoButton'; // Import the new FAB

export const metadata: Metadata = {
  title: 'Eko - Voice Social Network',
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
    <html lang="en" dir="ltr" className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> {/* Wrap with AuthProvider */}
            <FontSizeProvider>
              {children}
              <FloatingCreateEkoButton /> {/* Add FAB here */}
              <Toaster />
            </FontSizeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
