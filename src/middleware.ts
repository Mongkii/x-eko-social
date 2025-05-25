
import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales, type Locale} from './i18n';

export default createMiddleware({
  locales: locales as unknown as Locale[], // Cast needed due to `as const` in i18n.ts
  defaultLocale: defaultLocale,
  localePrefix: 'as-needed', // Prepend locale to path only when not default
  // pathnames: { // Example for path localization if needed later
  //   '/': '/',
  //   '/saved-ads': {
  //     en: '/saved-ads',
  //     es: '/anuncios-guardados'
  //   }
  // }
});

export const config = {
  // Match only internationalized pathnames
  // Skip all internal paths (_next) and static files, and API routes.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
