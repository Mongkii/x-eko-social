"use client";

import i18nextInstance from '@/i18n/config';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface I18nInitializerProps {
  children: ReactNode;
}

function SetHtmlLangDir() {
  const { i18n } = useTranslation();
  useEffect(() => {
    // Only set lang/dir if i18next is initialized and we are on the client
    if (i18n.isInitialized && typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
      document.documentElement.dir = i18n.dir(i18n.language);
    }
  }, [i18n, i18n.language, i18n.isInitialized]); // Depend on i18n.isInitialized
  return null;
}

const GlobalLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-accent" />
  </div>
);

export function I18nInitializer({ children }: I18nInitializerProps) {
  // This state confirms i18next is ready on the client side.
  const [isI18nextReadyOnClient, setIsI18nextReadyOnClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client.
    const initHandler = () => {
      setIsI18nextReadyOnClient(true);
      i18nextInstance.off('initialized', initHandler);
    };

    if (i18nextInstance.isInitialized) {
      // If already initialized by the time this effect runs
      setIsI18nextReadyOnClient(true);
    } else {
      // Otherwise, attach the event listener.
      // init() should have been called by config.ts when imported.
      i18nextInstance.on('initialized', initHandler);
    }

    // Cleanup
    return () => {
      i18nextInstance.off('initialized', initHandler);
    };
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  if (!isI18nextReadyOnClient) {
    // On the server, isI18nextReadyOnClient is false.
    // On the client, during the first render (before useEffect), isI18nextReadyOnClient is false.
    // Both should render this loader, aiming to prevent hydration mismatch.
    return <GlobalLoader />;
  }

  // This part is rendered only after the client has confirmed i18next is initialized and ready.
  return (
    <I18nextProvider i18n={i18nextInstance}>
      <SetHtmlLangDir />
      {/* Children are rendered directly. If they need Suspense for their own async ops,
          they should implement it. */}
      {children}
    </I18nextProvider>
  );
}
