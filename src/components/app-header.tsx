
"use client";

import Link from 'next/link'; // Changed from '@/navigation'
import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggleSwitch } from '@/components/theme-toggle-switch';
import { Bookmark, Wand2, Settings } from 'lucide-react';
import { FontSizeSwitcher } from '@/components/font-size-switcher';
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
  onPersonalize: () => Promise<void> | void;
}

export function AppHeader({ onPersonalize }: AppHeaderProps) {

  const handlePersonalizeClick = async () => {
    await onPersonalize();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-auto flex items-center space-x-2">
          <AppLogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-primary">
            Eko
          </span>
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link href="/saved-ads">
                    <Bookmark className="h-5 w-5" />
                    <span className="sr-only">Saved EkoDrops</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saved EkoDrops</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handlePersonalizeClick} variant="ghost" size="icon" className="h-9 w-9">
                  <Wand2 className="h-5 w-5" />
                  <span className="sr-only">Personalize My Feed (AI)</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Personalize My Feed (AI)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Settings className="h-5 w-5" />
                       <span className="sr-only">Settings</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent className="w-56" align="end">
              {/* LanguageSwitcher removed */}
              <DropdownMenuLabel>Font Size</DropdownMenuLabel>
               <DropdownMenuGroup>
                <FontSizeSwitcher />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuItem className="focus:bg-transparent focus:text-current hover:bg-transparent">
                <div className="w-full flex justify-center">
                   <ThemeToggleSwitch />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </nav>
      </div>
    </header>
  );
}
