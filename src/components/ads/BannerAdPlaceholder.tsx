
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

interface BannerAdPlaceholderProps {
  title?: string;
}

export function BannerAdPlaceholder({ title = "Your Advertisement Here" }: BannerAdPlaceholderProps) {
  return (
    <Card className="w-full max-w-xl mx-auto my-6 shadow-md bg-muted/30 border-dashed border-accent/50">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <Megaphone className="w-10 h-10 text-accent mb-2" />
          <p className="text-sm font-semibold text-accent">{title}</p>
          <p className="text-xs text-muted-foreground">(Banner Ad Placeholder - 320x50)</p>
        </div>
      </CardContent>
    </Card>
  );
}
