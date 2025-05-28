
"use client";

import { useFontSize } from '@/contexts/font-size-context';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

export function FontSizeSwitcher() {
  const { fontSize, setFontSize } = useFontSize();

  const fontSizes = [
    { label: "صغير", value: "sm" },
    { label: "متوسط", value: "md" },
    { label: "كبير", value: "lg" },
  ];

  return (
    <>
      {fontSizes.map((fs) => (
        <Button
          key={fs.value}
          variant="ghost"
          size="sm"
          className="w-full justify-between text-sm"
          onClick={() => setFontSize(fs.value as 'sm' | 'md' | 'lg')}
        >
          {fs.label}
          {fontSize === fs.value && <Check className="h-4 w-4" />}
        </Button>
      ))}
    </>
  );
}
