
"use client";

import { usePathname, useRouter, Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale });
  };

  const languageNames: Record<Locale, string> = {
    en: t('english'),
    ar: t('arabic'),
    es: t('spanish'),
    ur: t('urdu'),
    fr: t('french'),
    de: t('german'),
    hi: t('hindi'),
    zh: t('chinese'),
    tl: t('tagalog'),
    ru: t('russian'),
  };

  return (
    <div className="px-2 py-1.5">
      <Select value={locale} onValueChange={onSelectChange}>
        <SelectTrigger className="w-full h-8 text-xs">
          <div className="flex items-center gap-2">
            <Languages size={14} />
            <SelectValue placeholder={t('selectLanguagePlaceholder')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc} className="text-xs">
              {languageNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
