
"use client";

import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FontSizeSwitcher } from '@/components/font-size-switcher';
import { Bookmark, Settings, Wand2 } from 'lucide-react';
import Link from 'next/link'; // Standard Next.js Link
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

interface AppHeaderProps {
  onPersonalizeFeed: () => void;
}

export function AppHeader({ onPersonalizeFeed }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2 rtl:space-x-reverse">
          <AppLogoIcon className="h-8 w-8 text-primary" /> {/* Eko logo/icon */}
          <span className="font-bold text-xl sm:inline-block text-primary">
            إيكو
          </span>
        </Link>
        
        <nav className="flex-grow">
          {/* Main navigation items can be added here if needed */}
        </nav>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onPersonalizeFeed} aria-label="تخصيص خلاصتي (ذكاء اصطناعي)">
                  <Wand2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>تخصيص خلاصتي (ذكاء اصطناعي)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/saved-eko-drops" passHref>
                  <Button variant="ghost" size="icon" aria-label="المحفوظات">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>إيكو دروبس المحفوظة</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="الإعدادات">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>الإعدادات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="p-0">
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-0">
                   <FontSizeSwitcher />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
