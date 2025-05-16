import Link from 'next/link';
import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleSwitch } from '@/components/theme-toggle-switch';

interface AppHeaderProps {
  onPersonalize: () => Promise<void>;
}

export function AppHeader({ onPersonalize }: AppHeaderProps) {
  const { toast } = useToast();

  const handlePersonalizeClick = async () => {
    toast({
      title: "AI Magic ✨",
      description: "Personalizing your ad feed... (Simulated)",
    });
    await onPersonalize();
     // Removed the second toast as it might be redundant with the AI flow's own toast
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
        <nav className="flex items-center space-x-4">
          <ThemeToggleSwitch />
          <Button onClick={handlePersonalizeClick} variant="outline" size="sm">
            Personalize My Feed (AI)
          </Button>
        </nav>
      </div>
    </header>
  );
}
