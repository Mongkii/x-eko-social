
"use client";

import { Button } from "@/components/ui/button";
import { X, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FullScreenAdPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenAdPlaceholder({ isOpen, onClose }: FullScreenAdPlaceholderProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl relative animate-in fade-in-0 zoom-in-95">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10"
          aria-label="Close ad"
        >
          <X className="h-5 w-5" />
        </Button>
        <CardHeader className="text-center items-center pt-8">
          <Zap className="w-12 h-12 text-accent mb-3" />
          <CardTitle className="text-2xl">Special Offer!</CardTitle>
          <CardDescription>This is a full-screen ad placeholder.</CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <img 
            src="https://placehold.co/300x250.png?text=Ad+Content" 
            alt="Ad content placeholder" 
            className="mx-auto my-4 rounded-md shadow"
            data-ai-hint="advertisement content"
          />
          <p className="text-sm text-muted-foreground mb-4">
            Imagine an engaging advertisement here. Click the button below to learn more (this is just a demo).
          </p>
          <Button size="lg" className="w-full" onClick={onClose}>
            Learn More & Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
