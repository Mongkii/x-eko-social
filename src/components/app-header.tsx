
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AppLogoIcon } from "@/components/icons/app-logo-icon";
import { ThemeToggle } from '@/components/theme-toggle';
import { FontSizeSwitcher } from '@/components/font-size-switcher';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Home, Search, UserCircle, Settings, LogIn, LogOut, Mic, Users, Edit } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/feed", label: "Feed", icon: Home, protected: false },
  { href: "/discover", label: "Discover", icon: Search, protected: false },
  // { href: "/notifications", label: "Notifications", icon: Bell, protected: true }, // Placeholder
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handleRecordEko = () => {
    if (!user) {
      router.push('/auth/login?redirect=/create-eko');
    } else {
      router.push('/create-eko');
    }
  };

  const getAvatarFallback = () => {
    if (userProfile?.username) return userProfile.username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  // Simplified for desktop usage, sheet links are handled explicitly below
  const renderDesktopNavLinks = () =>
    navLinks
      .filter(link => !link.protected || (link.protected && user))
      .map((link) => (
        <Button
          key={link.href}
          variant="link"
          asChild
          className={cn(
            "transition-colors hover:text-accent no-underline",
            pathname === link.href
              ? "text-accent font-semibold"
              : "text-muted-foreground"
          )}
        >
          <Link href={link.href}>
            {/* Desktop links typically don't have icons in this design */}
            <span>{link.label}</span>
          </Link>
        </Button>
      ));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <AppLogoIcon className="h-8 w-8 text-accent" />
          <span className="font-bold text-xl">Eko</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {renderDesktopNavLinks()}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          {user && (
            <>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={handleRecordEko} aria-label="Record Eko">
                 <Edit className="h-5 w-5" />
                 <span className="sr-only">Record Eko</span>
              </Button>
              <Button variant="default" size="sm" className="hidden md:flex items-center" onClick={handleRecordEko}>
                <Edit className="mr-2 h-4 w-4" />
                Create Eko
              </Button>
            </>
          )}
          <FontSizeSwitcher />
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8" data-ai-hint="user avatar">
                    <AvatarImage src={userProfile?.avatarURL || ""} alt={userProfile?.username || user.email || ""} />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.username || "Eko User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push(`/profile/${userProfile?.username_lowercase || user.uid}`)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">
                  <Users className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              {/* Content is now direct children of SheetContent */}
              <div className="flex flex-col space-y-4 p-4">
                <SheetClose asChild>
                  <Link href="/" className="flex items-center space-x-2 mb-4">
                    <AppLogoIcon className="h-8 w-8 text-accent" />
                    <span className="font-bold text-lg">Eko</span>
                  </Link>
                </SheetClose>
                
                <div className="flex flex-col space-y-1">
                  {navLinks
                    .filter(link => !link.protected || (link.protected && user))
                    .map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start text-left flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
                            pathname === link.href
                              ? "bg-accent/20 text-accent"
                              : "text-muted-foreground"
                          )}
                        >
                          <Link href={link.href}>
                            <link.icon className="h-5 w-5" />
                            <span>{link.label}</span>
                          </Link>
                        </Button>
                      </SheetClose>
                    ))}
                </div>
                <hr />
                 {loading ? (
                    <div className="p-2 text-muted-foreground">Loading...</div>
                 ) : user ? (
                  <>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        asChild
                        className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start"
                      >
                        <Link href={`/profile/${userProfile?.username_lowercase || user.uid}`}>
                          <UserCircle className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        asChild
                        className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start"
                      >
                         <Link href="/settings">
                          <Settings className="h-5 w-5" />
                          <span>Settings</span>
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </Button>
                    </SheetClose>
                  </>
                 ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="ghost" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start">
                        <Link href="/auth/login">
                          <LogIn className="h-5 w-5" />
                          <span>Login</span>
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                     <Button asChild variant="default" className="w-full justify-start">
                        <Link href="/auth/signup" className="flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>Sign Up</span>
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                 )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Removed the `declare module` block for SheetContentProps as it's no longer needed
// and was part of the problematic pattern.
// declare module "@/components/ui/sheet" {
//   interface SheetContentProps {
//     closeFunctionProp?: (closeSheet: () => void) => React.ReactNode;
//   }
// }
