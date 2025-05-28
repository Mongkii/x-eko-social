
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type FontSize = 'sm' | 'md' | 'lg';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_STORAGE_KEY = 'eko_font_size';

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('md'); // Default to medium

  useEffect(() => {
    // Load saved font size from localStorage on initial client-side render
    const storedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize | null;
    if (storedFontSize && ['sm', 'md', 'lg'].includes(storedFontSize)) {
      setFontSizeState(storedFontSize);
      document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'font-size-sm', 'font-size-md', 'font-size-lg');
      document.documentElement.classList.add(`font-size-${storedFontSize}`);
    } else {
      // Set default if nothing stored or invalid
      document.documentElement.classList.add(`font-size-md`);
    }
  }, []);

  const setFontSize = useCallback((newSize: FontSize) => {
    if (['sm', 'md', 'lg'].includes(newSize)) {
      setFontSizeState(newSize);
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, newSize);
      document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
      document.documentElement.classList.add(`font-size-${newSize}`);
    } else {
      console.warn(`Invalid font size: ${newSize}. Defaulting to 'md'.`);
      setFontSizeState('md');
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, 'md');
      document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
      document.documentElement.classList.add(`font-size-md`);
    }
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextType {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
