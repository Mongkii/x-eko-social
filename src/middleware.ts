
import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // For a single-locale app where you don't want /en/ prefix,
  // 'as-needed' is fine, or you might consider 'never' if you only ever want '/'
  // However, to ensure all next-intl features work correctly, 'as-needed' is generally safer.
  localePrefix: 'as-needed' 
});

export const config = {
  // Match only internationalized pathnames
  // Skip all internal paths (_next) and static files
  // For a single language app, this effectively means it will match '/' and redirect to '/en'
  // (or just serve '/' as 'en' content depending on localePrefix)
  // then apply to '/en/*'
  matcher: ['/', '/(en)/:path*']
};

