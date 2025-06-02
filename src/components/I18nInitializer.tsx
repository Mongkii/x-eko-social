
"use client";

import i18nextInstance from '@/i18n/config'; // Ensure this path is correct
import type { ReactNode} from 'react';
import { useEffect, useState, Suspense } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface I18nInitializerProps {
  children: ReactNode;
}

function SetHtmlLangDir() {
  const { i18n } = useTranslation(); // This hook will suspend if i18n not ready and useSuspense=true
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
      document.documentElement.dir = i18n.dir(i18n.language);
    }
  }, [i18n, i18n.language]);
  return null;
}

const GlobalLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-accent" />
  </div>
);

export function I18nInitializer({ children }: I18nInitializerProps) {
  // This state will be false on the server and initially on the client.
  // It will only be set to true on the client after i18next is confirmed to be initialized.
  const [isI18nextReadyForClient, setIsI18nextReadyForClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client.
    const initHandler = () => {
      setIsI18nextReadyForClient(true);
      // Clean up the event listener once it has fired
      i18nextInstance.off('initialized', initHandler);
    };

    if (i18nextInstance.isInitialized) {
      // If already initialized by the time this effect runs (e.g., from a previous navigation)
      setIsI18nextReadyForClient(true);
    } else {
      // Otherwise, attach the event listener
      i18nextInstance.on('initialized', initHandler);
    }

    // Cleanup: In case the component unmounts before 'initialized' fires
    return () => {
      i18nextInstance.off('initialized', initHandler);
    };
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  if (!isI18nextReadyForClient) {
    // On the server, isI18nextReadyForClient is false.
    // On the client, during the first render (before useEffect), isI18nextReadyForClient is false.
    // Both will render this loader, ensuring the initial HTML matches, preventing hydration error.
    return <GlobalLoader />;
  }

  // This part is rendered only after the client has confirmed i18next is initialized and ready.
  return (
    <I18nextProvider i18n={i18nextInstance}>
      <SetHtmlLangDir />
      {/* The Suspense here is for children that might themselves suspend,
          e.g., for data fetching or if they use useTranslation before their specific namespaces are loaded by HttpBackend. */}
      <Suspense fallback={<GlobalLoader />}>
        {children}
      </Suspense>
    </I18nextProvider>
  );
}
