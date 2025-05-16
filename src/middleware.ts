import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // Make sure this is consistent with the localePrefix in your i18n.ts if you use it
  // For a simple setup without locale prefixes in URLs for the default locale:
  localePrefix: 'as-needed', // or 'always' or 'never'
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};