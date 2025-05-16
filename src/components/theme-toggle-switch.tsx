
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ThemeToggleSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder to prevent layout shift and hydration mismatch
    return (
      <div className="flex items-center space-x-2 h-9 w-[100px]" aria-hidden="true">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-6 w-11 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    );
  }

  const isDarkMode = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun
        className={cn(
          "h-5 w-5 transition-colors",
          !isDarkMode ? "text-primary" : "text-muted-foreground"
        )}
      />
      <Switch
        id="theme-switch"
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      />
      <Moon
        className={cn(
          "h-5 w-5 transition-colors",
          isDarkMode ? "text-primary" : "text-muted-foreground"
        )}
      />
    </div>
  );
}
