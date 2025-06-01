
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type FontSize = 'sm' | 'md' | 'lg';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const applyFontSizeToDocument = (fontSize: FontSize) => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }
};

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('md'); // Default to medium

  useEffect(() => {
    // Load saved font size from localStorage on mount
    const savedFontSize = localStorage.getItem('eko-font-size') as FontSize | null;
    if (savedFontSize && ['sm', 'md', 'lg'].includes(savedFontSize)) {
      setFontSizeState(savedFontSize);
      applyFontSizeToDocument(savedFontSize);
    } else {
      applyFontSizeToDocument('md'); // Apply default if nothing saved or invalid
    }
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('eko-font-size', size);
    applyFontSizeToDocument(size);
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
