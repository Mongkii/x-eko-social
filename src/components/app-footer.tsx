
"use client";

import Link from "next/link"; // Standard Next.js Link
import { AppLogoIcon } from "./icons/app-logo-icon";

export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-start">
          <div>
            <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse mb-4">
              <AppLogoIcon className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg text-primary">
                إيكو
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} إيكو. جميع الحقوق محفوظة.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">عن إيكو</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">اتصل بنا</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">الأسئلة الشائعة</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">قانوني</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">شروط الخدمة</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">سياسة الخصوصية</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
