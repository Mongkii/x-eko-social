"use client";

import { useRouter, usePathname } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher"); // For potential labels if needed

  const languages: { value: Locale; label: string }[] = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ];

  const onSelectLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Select value={locale} onValueChange={onSelectLanguage}>
      <SelectTrigger className="w-auto gap-2 border-0 px-2 py-1.5 text-sm focus:ring-0 focus:ring-offset-0 [&_svg]:size-3.5 [&_span]:font-medium">
        <Globe />
        <SelectValue placeholder={t("selectLanguage")} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
