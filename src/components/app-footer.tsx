
"use client";

import { Link } from "@/navigation";
import { AppLogoIcon } from "./icons/app-logo-icon";
import { useTranslations } from 'next-intl';

export function AppFooter() {
  const t = useTranslations('AppFooter');
  const tGlobal = useTranslations('Global');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-start">
          <div>
            <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse mb-4">
              <AppLogoIcon className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg text-primary">
                {tGlobal('appName')}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('copyright', {year: currentYear})}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Legal Marketplace</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">All Services</Link></li>
              <li><Link href="/provider/onboarding" className="text-sm text-muted-foreground hover:text-primary">Become a Provider</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">{t('faq')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">{t('aboutUs')}</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">{t('contactUs')}</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">{t('termsOfService')}</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">{t('privacyPolicy')}</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
