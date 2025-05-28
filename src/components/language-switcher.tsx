"use client";

import { usePathname, useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    // ru: t('russian'), // Removed as per BRD
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="ml-2">{languageNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem key={loc} onClick={() => onSelectChange(loc)} disabled={loc === locale}>
            {languageNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}