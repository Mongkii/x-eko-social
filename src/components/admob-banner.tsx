
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react'; // Using Zap as a generic ad/promo icon

export function AdMobBanner() {
  // In a real app, this would use environment variables for Ad Unit ID.
  // For this Arabic-only version, text is hardcoded.
  const adUnitId = process.env.NEXT_PUBLIC_ADMOB_BANNER_AD_UNIT_ID || "ca-app-pub-xxxxxxxx/yyyyyyyy";

  if (!process.env.NEXT_PUBLIC_ADMOB_BANNER_AD_UNIT_ID) {
    // console.warn("AdMob Banner Ad Unit ID is not configured.");
    // return null; // Optionally hide if not configured
  }

  return (
    <Card className="w-full my-4 border-primary/50 shadow-md">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm font-medium text-primary flex items-center">
          <Zap className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          إعلان تجريبي
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          هذا محاكاة لإعلان بانر من AdMob.
        </p>
        <p className="text-xxs text-muted-foreground/70 mt-1">
          معرف الوحدة الإعلانية: {adUnitId}
        </p>
      </CardContent>
    </Card>
  );
}
