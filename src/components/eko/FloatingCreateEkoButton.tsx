
"use client";

import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function FloatingCreateEkoButton() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleClick = () => {
    if (!user) {
      router.push('/auth/login?redirect=/create-eko');
    } else {
      router.push('/create-eko');
    }
  };

  // Don't show button if auth state is loading to prevent flicker or premature action
  if (loading) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-xl", // FAB specific styles
        "bg-accent hover:bg-accent/90 text-accent-foreground" // Using accent color for FAB
      )}
      onClick={handleClick}
      aria-label="Create EkoDrop"
      title="Create EkoDrop"
    >
      <Mic className="h-7 w-7" />
    </Button>
  );
}
