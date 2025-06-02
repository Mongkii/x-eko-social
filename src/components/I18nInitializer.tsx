
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
  const { i18n } = useTranslation();
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
      document.documentElement.dir = i18n.dir(i18n.language);
    }
  }, [i18n, i18n.language]);
  return null;
}

export function I18nInitializer({ children }: I18nInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(i18nextInstance.isInitialized);

  useEffect(() => {
    if (!i18nextInstance.isInitialized) {
      // The instance is initialized in config.ts, we just wait for it
      const initHandler = () => setIsInitialized(true);
      i18nextInstance.on('initialized', initHandler);
      // If it's already initialized by the time this effect runs
      if (i18nextInstance.isInitialized) {
        setIsInitialized(true);
      }
      return () => {
        i18nextInstance.off('initialized', initHandler);
      };
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18nextInstance}>
      <SetHtmlLangDir />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>}>
        {children}
      </Suspense>
    </I18nextProvider>
  );
}
