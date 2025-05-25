
"use client";

import { ShieldBan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function AdMobBanner() {
  const t = useTranslations('AdMobBanner');
  const adUnitId = process.env.NEXT_PUBLIC_ADMOB_BANNER_AD_UNIT_ID;

  if (!adUnitId) {
    return null; 
  }

  return (
    <Card className="w-full max-w-md mx-auto my-4 border-dashed border-muted-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
          <ShieldBan className="w-4 h-4 mr-2 text-yellow-500" />
          {t('demoBannerTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded text-center">
          {t('demoAdUnitIdLabel')}: {adUnitId}
          <p className="text-[10px] mt-1">({t('placeholderNotice')})</p>
        </div>
      </CardContent>
    </Card>
  );
}
