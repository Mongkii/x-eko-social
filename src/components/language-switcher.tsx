
"use client";

import * as React from "react";
import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/auth-context"; // For future use to get/set user's preferred language

// For now, we'll use a hardcoded list. In a full i18n setup, this might come from config.
// The UserProfile type already has SupportedLanguage, but we'll keep this simple for the placeholder.
const availableLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
  // Add more as defined in src/lib/types.ts: SupportedLanguage if needed
];

export function LanguageSwitcher() {
  const { toast } = useToast();
  // const { userProfile, updateUserProfile } = useAuth(); // Placeholder for future use
  const [currentLanguage, setCurrentLanguage] = React.useState("en"); // Default to English for placeholder

  const handleLanguageChange = (langCode: string) => {
    // For now, just show a toast.
    // In a real implementation, this would trigger language change in i18n system
    // and potentially update user profile preference.
    setCurrentLanguage(langCode); // Visually update the checkmark for demo
    toast({
      title: "Language Switcher",
      description: `Language switching to "${availableLanguages.find(l => l.code === langCode)?.name}" is a feature coming soon!`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <div className="flex items-center justify-between w-full">
              <span>{lang.name}</span>
              {currentLanguage === lang.code && <Check className="h-4 w-4 ml-2 text-accent" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
