
"use client";

import type { FontSizePreference } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FontSizeContextType {
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_STORAGE_KEY = 'eko-font-size';
const VALID_FONT_SIZES: FontSizePreference[] = ['sm', 'md', 'lg'];

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSizePreference>('md'); // Default font size

  useEffect(() => {
    let storedFontSize: FontSizePreference | null = null;
    try {
      storedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizePreference | null;
    } catch (error) {
        console.warn("Could not access localStorage for font size:", error);
    }

    if (storedFontSize && VALID_FONT_SIZES.includes(storedFontSize)) {
      setFontSizeState(storedFontSize);
    } else {
      // Apply default if nothing stored or invalid, and store it
      setFontSizeState('md');
      try {
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, 'md');
      } catch (error) {
        console.warn("Could not save default font size to localStorage:", error);
      }
    }
  }, []);

  // Apply class to documentElement whenever fontSize changes
  useEffect(() => {
    document.documentElement.classList.remove(...VALID_FONT_SIZES.map(s => `font-size-${s}`));
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);


  const setFontSize = (size: FontSizePreference) => {
    if (VALID_FONT_SIZES.includes(size)) {
      setFontSizeState(size);
      try {
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
      } catch (error) {
        console.warn("Could not save font size to localStorage:", error);
      }
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
