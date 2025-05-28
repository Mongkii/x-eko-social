
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { cn } from '@/lib/utils';

// Metadata will be handled by the [locale]/layout.tsx for localized titles.
// This RootLayout can have generic metadata if needed.
export const metadata: Metadata = {
  title: 'Ameenee Marketplace', // Generic title
  description: 'Legal services marketplace by Ameenee.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The lang and dir attributes will be set in [locale]/layout.tsx
  return (
    <html lang="en" dir="ltr" className={cn("h-full", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
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
