import Link from 'next/link';
import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Button } from '@/components/ui/button';
import { personalizeAdFeed } from '@/ai/flows/personalize-ad-feed';
import { useToast } from '@/hooks/use-toast';

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
     toast({
      title: "Feed Personalized!",
      description: "Your ad feed has been updated based on your preferences.",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AppLogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-primary">
            Shopyme
          </span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-4">
          <Button onClick={handlePersonalizeClick} variant="outline" size="sm">
            Personalize My Feed (AI)
          </Button>
        </nav>
      </div>
    </header>
  );
}
