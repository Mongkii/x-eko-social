
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AppLogoIcon } from "@/components/icons/app-logo-icon";
import { ThemeToggle } from '@/components/theme-toggle';
import { FontSizeSwitcher } from '@/components/font-size-switcher';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"; // Added SheetClose
import { Menu, Home, Search, Bell, UserCircle, Settings, LogIn, LogOut, Mic, Users } from 'lucide-react';
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
  { href: "/feed", label: "Feed", icon: Home, protected: false }, // Feed can be public
  { href: "/discover", label: "Discover", icon: Search, protected: false }, // Discover can be public
  // { href: "/notifications", label: "Notifications", icon: Bell, protected: true }, // Placeholder
  // { href: "/profile/me", label: "Profile", icon: UserCircle, protected: true }, // Placeholder
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
      router.push('/auth/login?redirect=/create-eko'); // Or open a login modal
    } else {
      // router.push('/create-eko'); // Navigate to EkoDrop creation page
      console.log("Navigate to EkoDrop creation page");
    }
  };

  const getAvatarFallback = () => {
    if (userProfile?.username) return userProfile.username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const renderNavLinks = (isSheet = false, closeSheet?: () => void) =>
    navLinks
      .filter(link => !link.protected || (link.protected && user))
      .map((link) => {
        const NavLinkContent = (
          <>
            {isSheet && <link.icon className="h-5 w-5" />}
            <span>{link.label}</span>
          </>
        );

        const navButton = (
          <Button
            key={link.href}
            variant={isSheet ? "ghost" : "link"}
            asChild={!isSheet} // For sheet, handle click directly
            className={cn(
              "w-full justify-start text-left",
              isSheet ? "flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground" : "transition-colors hover:text-accent no-underline",
              pathname === link.href
                ? (isSheet ? "bg-accent/20 text-accent" : "text-accent font-semibold")
                : (isSheet ? "text-muted-foreground" : "text-muted-foreground")
            )}
            onClick={isSheet ? () => { router.push(link.href); closeSheet?.(); } : undefined}
          >
            {isSheet ? NavLinkContent : <Link href={link.href}>{NavLinkContent}</Link>}
          </Button>
        );
        
        // No need for SheetClose wrapper around each button, SheetClose on parent or direct onClick on button is fine.
        return navButton;
      });


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <AppLogoIcon className="h-8 w-8 text-accent" />
          <span className="font-bold text-xl">Eko</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          {user && (
            <>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={handleRecordEko}>
                 <Mic className="h-5 w-5" />
                 <span className="sr-only">Record Eko</span>
              </Button>
              <Button variant="default" size="sm" className="hidden md:flex items-center" onClick={handleRecordEko}>
                <Mic className="mr-2 h-4 w-4" />
                Record Eko
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
                  <Avatar className="h-8 w-8">
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
                  <DropdownMenuItem onClick={() => router.push(`/profile/${userProfile?.username || user.uid}`)}>
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
              {(sheetClose) => ( // SheetContent can pass down a close function
                <div className="flex flex-col space-y-4 p-4">
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center space-x-2 mb-4">
                      <AppLogoIcon className="h-8 w-8 text-accent" />
                      <span className="font-bold text-lg">Eko</span>
                    </Link>
                  </SheetClose>
                  <div className="flex flex-col space-y-1">
                   {renderNavLinks(true, sheetClose)}
                  </div>
                  <hr />
                   {loading ? (
                      <div className="p-2 text-muted-foreground">Loading...</div>
                   ) : user ? (
                    <>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={() => { router.push(`/profile/${userProfile?.username || user.uid}`); }}
                          className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start"
                        >
                          <UserCircle className="h-5 w-5" />
                          <span>Profile</span>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={() => { router.push('/settings'); }}
                          className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start"
                        >
                          <Settings className="h-5 w-5" />
                          <span>Settings</span>
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
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
