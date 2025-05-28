
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'إيكو: شبكة التواصل الصوتي', // Arabic: Eko: Voice Social Network
  description: 'إيكو - شبكتك الاجتماعية الصوتية الأولى.', // Arabic: Eko - Your voice-first social network.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cn("h-full", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <body className="antialiased h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
