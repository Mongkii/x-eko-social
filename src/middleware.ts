
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, Locale } from './i18n';
 
export default createMiddleware({
  locales: locales as unknown as Locale[],
  defaultLocale: defaultLocale,
  localePrefix: 'as-needed', 
});
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)']
};
