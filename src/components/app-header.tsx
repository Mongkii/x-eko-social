
"use client";

import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FontSizeSwitcher } from '@/components/font-size-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Settings, UserCircle, LogIn, Briefcase, LayoutDashboard } from 'lucide-react';
import { Link } from '@/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';
import * as React from 'react';

export function AppHeader() {
  const t = useTranslations('AppHeader');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Simulate auth state

  // Simulate login/logout for UI demonstration
  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2 rtl:space-x-reverse">
          <AppLogoIcon className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl sm:inline-block text-primary">
            {t('appName')}
          </span>
        </Link>
        
        <nav className="hidden md:flex flex-grow items-center space-x-6 rtl:space-x-reverse text-sm font-medium">
          <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('services')}
          </Link>
          <Link href="/provider/onboarding" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('becomeAProvider')}
          </Link>
          {/* Add more nav links here as needed */}
        </nav>

        <div className="flex items-center space-x-2 rtl:space-x-reverse ml-auto">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <UserCircle className="h-5 w-5" />
                   <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Ameenee User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@ameenee.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard"><LayoutDashboard className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('dashboard')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/provider/dashboard"><Briefcase className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('providerDashboard', {defaultValue: "Provider Area"})}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin"><Settings className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('admin')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleLogin}>
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={toggleLogin} variant="outline">
              <LogIn className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('login')}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('settings')}>
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{t('settings')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2">{t('theme')}</DropdownMenuLabel>
                <ThemeToggle /> 
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                 <DropdownMenuLabel className="text-xs text-muted-foreground px-2">{t('fontSize')}</DropdownMenuLabel>
                 <FontSizeSwitcher />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
               <DropdownMenuGroup>
                 <DropdownMenuLabel className="text-xs text-muted-foreground px-2">{t('language')}</DropdownMenuLabel>
                 <LanguageSwitcher />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
