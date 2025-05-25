
import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, defaultLocale, type Locale} from '@/i18n';

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({
    locales: locales as unknown as Locale[],  // Cast needed due to `as const`
    localePrefix: 'as-needed',
    // pathnames: { // Example, align with middleware if used
    //   '/': '/',
    //   '/saved-ads': {
    //     en: '/saved-ads',
    //     es: '/anuncios-guardados'
    //   }
    // }
  });
