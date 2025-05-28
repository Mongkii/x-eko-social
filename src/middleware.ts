
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't prefix the URL for the default locale (e.g. / instead of /en)
  localePrefix: 'as-needed', 
});

export const config = {
  // Match only internationalized pathnames
  // Adjust this to include all relevant paths if you have non-localized paths.
  // Example: ['/', '/(ar|en)/:path*']
  // For now, let's match all paths except for API, _next/static, _next/image, and favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
