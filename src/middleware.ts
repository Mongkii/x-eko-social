
import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // Make sure this matches your pathnames config
  localePrefix: 'as-needed' 
});

export const config = {
  // Match only internationalized pathnames
  // Skip all internal paths (_next) and static files
  matcher: ['/', '/(en)/:path*']
};
