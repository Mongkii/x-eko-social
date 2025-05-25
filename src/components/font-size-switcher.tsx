
"use client";

import { useFontSize } from '@/contexts/font-size-context';
import type { FontSizePreference } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type } from 'lucide-react';
import { useTranslations } from 'next-intl';


export function FontSizeSwitcher() {
  const { fontSize, setFontSize } = useFontSize();
  const t = useTranslations('FontSizeSwitcher');

  const fontSizes: { value: FontSizePreference; label: string }[] = [
    { value: 'sm', label: t('small') },
    { value: 'md', label: t('medium') },
    { value: 'lg', label: t('large') },
  ];

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize as FontSizePreference);
  };

  return (
    <div className="px-2 py-1.5">
      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger className="w-full h-8 text-xs">
          <div className="flex items-center gap-2">
            <Type size={14} />
            <SelectValue placeholder={t('selectFontSizePlaceholder')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size.value} value={size.value} className="text-xs">
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
