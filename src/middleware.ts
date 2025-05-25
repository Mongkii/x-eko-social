
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, Locale } from './i18n';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: locales as unknown as Locale[], // Cast needed for createMiddleware
  
  // Used when no locale prefix is present (e.g. `/about`)
  defaultLocale: defaultLocale,

  // Always show the locale prefix, even for the default locale (e.g. /en/about)
  // localePrefix: 'always', 
  // Or 'as-needed' to only show for non-default locales (e.g. /fr/about but /about for English)
  localePrefix: 'as-needed',
});
 
export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
