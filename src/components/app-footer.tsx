
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { AppLogoIcon } from "./icons/app-logo-icon";

export function AppFooter() {
  const t = useTranslations("Global"); // Assuming some global keys might be used

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <AppLogoIcon className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg text-primary">
                {t('appName')}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {t('appName')}. All rights reserved.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Services</Link></li>
              <li><Link href="/provider/onboarding" className="text-sm text-muted-foreground hover:text-primary">Become a Provider</Link></li>
              {/* Add other links like About Us, Contact, FAQ */}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
