
"use client";

import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Briefcase, LayoutDashboard, LogIn, LogOut, UserCircle, Settings, ShieldCheck, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react'; // For simulated auth state
import type { User } from '@/lib/types';
import { sampleUserData, sampleAdminUserData, sampleProviderUserData } from '@/lib/placeholder-data'; // For simulation

// Simulate auth context for demo purposes
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data. In a real app, this would come from Firebase Auth.
    // To test different roles, uncomment one of these:
    // setCurrentUser(sampleUserData);
    // setCurrentUser(sampleAdminUserData);
    // setCurrentUser(sampleProviderUserData);
    setCurrentUser(null); // Default to logged out
    setIsLoading(false);
  }, []);

  const loginAs = (role: 'user' | 'admin' | 'provider') => {
    if (role === 'user') setCurrentUser(sampleUserData);
    else if (role === 'admin') setCurrentUser(sampleAdminUserData);
    else if (role === 'provider') setCurrentUser(sampleProviderUserData);
  };
  const logout = () => setCurrentUser(null);

  return { currentUser, isLoading, loginAs, logout };
};


export function AppHeader() {
  const t = useTranslations('AppHeader');
  const tGlobal = useTranslations('Global');
  const pathname = usePathname();
  const { currentUser, isLoading, loginAs, logout } = useAuth();

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center animate-pulse">
          <div className="h-8 w-24 bg-muted rounded"></div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="h-8 w-24 bg-muted rounded"></div>
            <div className="h-8 w-8 bg-muted rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }
  
  // Hide header for auth pages or specific simple pages if needed
  if (pathname.startsWith('/auth')) { // Example: hide on auth pages
      return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AppLogoIcon className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg sm:inline-block text-primary">
            {tGlobal('appName')}
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/services" className="text-muted-foreground transition-colors hover:text-foreground">
            {t('marketplace')}
          </Link>
          {!currentUser?.isProvider && (
            <Link href="/provider/onboarding" className="text-muted-foreground transition-colors hover:text-foreground">
              {t('becomeProvider')}
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          {currentUser ? (
            <>
              {currentUser.isProvider && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/provider/dashboard">
                    <Briefcase className="mr-2 h-4 w-4" /> {t('providerDashboard')}
                  </Link>
                </Button>
              )}
              {currentUser.isAdmin && (
                 <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" /> {t('admin')}
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name || "User"} />
                      <AvatarFallback>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserCircle/>}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name || "User"}</p>
                      {currentUser.email && <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{t('myDashboard')}</span>
                      </Link>
                    </DropdownMenuItem>
                    {/* Add other user-specific links here */}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{tGlobal('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
             {/* Demo login buttons */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Login As...</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => loginAs('user')}>User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loginAs('provider')}>Provider</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loginAs('admin')}>Admin</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t('settingsTooltip')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{t('settingsTooltip')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="p-0">
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-0">
                  <LanguageSwitcher />
                </DropdownMenuItem>
                {/* Add Font Size Switcher if re-enabled */}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
