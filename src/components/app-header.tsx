
import Link from 'next/link';
import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleSwitch } from '@/components/theme-toggle-switch';
import { Bookmark } from 'lucide-react';

interface AppHeaderProps {
  onPersonalize: () => Promise<void> | void; // Allow void if personalization is not applicable
}

export function AppHeader({ onPersonalize }: AppHeaderProps) {
  const { toast } = useToast();

  const handlePersonalizeClick = async () => {
    // The toast specific to starting personalization is now in page.tsx
    // to allow dummyPersonalize to have its own toast.
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
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggleSwitch />
          <Button variant="outline" size="sm" asChild>
            <Link href="/saved-ads">
              <Bookmark className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Saved Ads</span>
            </Link>
          </Button>
          <Button onClick={handlePersonalizeClick} variant="outline" size="sm">
            Personalize My Feed (AI)
          </Button>
        </nav>
      </div>
    </header>
  );
}
