
import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales} from './i18n'; // Ensure this path is correct and locales is exported from i18n.ts

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales, localePrefix: 'as-needed'});
