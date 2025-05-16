
"use client";

import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggleSwitch } from '@/components/theme-toggle-switch';
import { Bookmark, Wand2 } from 'lucide-react';
import Link from 'next/link'; // Changed from @/navigation
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
            Shopyme
          </span>
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggleSwitch />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link href="/saved-ads">
                    <Bookmark className="h-5 w-5" />
                    <span className="sr-only">Saved Ads</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saved Ads</p>
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
        </nav>
      </div>
    </header>
  );
}
