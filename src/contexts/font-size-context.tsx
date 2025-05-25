
"use client";

import type { FontSizePreference } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FontSizeContextType {
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSizePreference>('md'); // Default font size

  useEffect(() => {
    const storedFontSize = localStorage.getItem('eko-font-size') as FontSizePreference | null;
    if (storedFontSize && ['sm', 'md', 'lg'].includes(storedFontSize)) {
      setFontSizeState(storedFontSize);
      document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
      document.documentElement.classList.add(`font-size-${storedFontSize}`);
    } else {
      // Apply default if nothing stored or invalid
      document.documentElement.classList.add(`font-size-md`);
    }
  }, []);

  const setFontSize = (size: FontSizePreference) => {
    if (['sm', 'md', 'lg'].includes(size)) {
      setFontSizeState(size);
      localStorage.setItem('eko-font-size', size);
      document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
      document.documentElement.classList.add(`font-size-${size}`);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
