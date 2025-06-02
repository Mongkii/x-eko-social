
"use client";

import Link from 'next/link';
import { AppLogoIcon } from "@/components/icons/app-logo-icon";
import { Github, Twitter, Facebook, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AppFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 py-8 text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <AppLogoIcon className="h-8 w-8 mr-2 text-accent" />
              <span className="text-xl font-bold text-foreground">{t('appName')}</span>
            </div>
            <p className="text-sm">
              {t('appName')} - {t('tagline')}
              <br />
              {/* Share your voice, connect with the world. */}
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3">{t('quickLinks')}</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-accent">{t('aboutEko')}</Link></li>
              <li><Link href="/careers" className="hover:text-accent">{t('careers')}</Link></li>
              <li><Link href="/press" className="hover:text-accent">{t('press')}</Link></li>
              <li><Link href="/blog" className="hover:text-accent">{t('blog')}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3">{t('legalSupport')}</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-accent">{t('terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-accent">{t('privacy')}</Link></li>
              <li><Link href="/cookies" className="hover:text-accent">{t('cookies')}</Link></li>
              <li><Link href="/help" className="hover:text-accent">{t('help')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            &copy; {currentYear} {t('allRightsReserved')}
          </p>
          <div className="flex space-x-4">
            <Link href="https://twitter.com/ekoapp" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://facebook.com/ekoapp" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="https://instagram.com/ekoapp" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="https://github.com/your-org/eko" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
