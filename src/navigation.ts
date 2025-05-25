
import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, defaultLocale, Locale} from './i18n'; // Ensure Locale type is imported
 
export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales: locales as unknown as Locale[], localePrefix: 'as-needed'});
