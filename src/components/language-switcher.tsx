
"use client";

import { useRouter, usePathname } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations('AppHeader'); // Or a more generic namespace if needed

  const onSelectChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale });
  };

  const getLanguageName = (locale: Locale) => {
    switch (locale) {
      case 'en': return 'English';
      case 'ar': return 'العربية (Arabic)';
      case 'es': return 'Español (Spanish)';
      case 'ur': return 'اردو (Urdu)';
      case 'fr': return 'Français (French)';
      case 'de': return 'Deutsch (German)';
      case 'hi': return 'हिन्दी (Hindi)';
      case 'zh': return '中文 (Chinese)';
      case 'tl': return 'Tagalog';
      case 'ru': return 'Русский (Russian)';
      default: return locale.toUpperCase();
    }
  };

  return (
    <div className="px-2 py-1.5">
      <Select value={currentLocale} onValueChange={onSelectChange}>
        <SelectTrigger className="w-full h-8 text-xs">
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <SelectValue placeholder={t('language')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale} className="text-xs">
              {getLanguageName(locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
