
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AppLogoIcon } from "@/components/icons/app-logo-icon";
import { ThemeToggle } from '@/components/theme-toggle';
import { FontSizeSwitcher } from '@/components/font-size-switcher';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Search, Bell, UserCircle, Settings, LogIn, Mic } from 'lucide-react';
import { usePathname } from 'next/navigation'; // Changed from next/navigation
import { cn } from '@/lib/utils';

const navLinks = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile/me", label: "Profile", icon: UserCircle },
];

// Placeholder for authentication status
const isAuthenticated = false; // Replace with actual auth check

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <AppLogoIcon className="h-8 w-8 text-accent" />
          <span className="font-bold text-xl">Eko</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-accent",
                pathname === link.href ? "text-accent" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
             <Mic className="h-5 w-5" />
             <span className="sr-only">Record EkoDrop</span>
          </Button>
          <Button variant="default" size="sm" className="hidden md:flex items-center">
            <Mic className="mr-2 h-4 w-4" />
            Record Eko
          </Button>
          <FontSizeSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 p-4">
                <Link href="/" className="flex items-center space-x-2 mb-4">
                  <AppLogoIcon className="h-8 w-8 text-accent" />
                  <span className="font-bold text-lg">Eko</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
                      pathname === link.href ? "bg-accent/20 text-accent" : "text-muted-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                <hr />
                 {isAuthenticated ? (
                  <Link
                    href="/settings"
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
                      pathname === "/settings" ? "bg-accent/20 text-accent" : "text-muted-foreground"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                 ) : (
                  <Link
                    href="/auth/login"
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
                       "text-muted-foreground"
                    )}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login / Sign Up</span>
                  </Link>
                 )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
