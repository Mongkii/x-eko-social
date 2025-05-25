
"use client";

import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggleSwitch } from '@/components/theme-toggle-switch';
import { Bookmark, Wand2, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
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
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AppHeaderProps {
  onPersonalize: () => Promise<void> | void; // Keep this prop for flexibility if needed elsewhere
}

export function AppHeader({ onPersonalize }: AppHeaderProps) {
  const t = useTranslations('AppHeader');
  const tHomePage = useTranslations('HomePage'); // For AI personalization toast
  const tGlobal = useTranslations('Global');
  const { toast } = useToast(); // Initialize toast

  const handlePersonalizeClick = async () => {
    // As per BRD, AI personalization is backend. This is a UI placeholder.
    toast({ 
      title: tHomePage('aiMagicToastTitle'), 
      description: tHomePage('aiMagicToastDescription') 
    });
    // Simulate some action if needed for UI feedback
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: tHomePage('aiFeedPersonalizedToastTitle'),
      description: tHomePage('aiFeedPersonalizedToastDescription')
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-auto flex items-center space-x-2">
          <AppLogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-primary">
            {tGlobal('appName')}
          </span>
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link href="/saved-eko-drops">
                    <Bookmark className="h-5 w-5" />
                    <span className="sr-only">{t('savedEkoDropsTooltip')}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('savedEkoDropsTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handlePersonalizeClick} variant="ghost" size="icon" className="h-9 w-9">
                  <Wand2 className="h-5 w-5" />
                  <span className="sr-only">{t('personalizeFeedTooltip')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('personalizeFeedTooltip')}</p>
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
                       <span className="sr-only">{t('settingsTooltip')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('settingsTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{t('languageLabel')}</DropdownMenuLabel>
              <DropdownMenuGroup>
                 <LanguageSwitcher />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('fontSizeLabel')}</DropdownMenuLabel>
               <DropdownMenuGroup>
                <FontSizeSwitcher />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('themeLabel')}</DropdownMenuLabel>
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
