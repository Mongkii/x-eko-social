
"use client";

import type { MarketplaceService } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { Star, UserCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: MarketplaceService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('ServiceCard'); // Assuming you might add specific keys here later
  const tGlobal = useTranslations('Global');

  const title = locale === 'ar' ? service.title_ar : service.title_en;
  const description = locale === 'ar' ? service.description_ar : service.description_en;
  const turnaroundTime = locale === 'ar' ? service.turnaround_time_ar : service.turnaround_time_en;

  return (
    <Link href={`/service/${service.id}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-lg">
        <CardHeader className="p-0 relative aspect-video w-full">
          <Image
            src={service.main_image_url || `https://placehold.co/600x338.png?text=${encodeURIComponent(title)}`}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={service.dataAiHint || "legal document consultation"}
          />
          {service.avg_rating && service.avg_rating >= 4.5 && (
             <Badge variant="destructive" className="absolute top-2 right-2 rtl:right-auto rtl:left-2 m-1 bg-accent text-accent-foreground">
                Top Rated
             </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-grow">
              {description}
            </CardDescription>
          )}
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground mt-2 mb-3">
             <Image 
                src={service.provider_avatar_url || 'https://placehold.co/40x40.png?text=P'}
                alt={service.provider_name || "Provider"}
                width={24}
                height={24}
                className="rounded-full"
                data-ai-hint={service.dataAiHintProvider || "professional portrait"}
              />
            <span>{service.provider_name || "Legal Advisor"}</span>
          </div>

          {service.avg_rating && (
            <div className="flex items-center text-xs mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 rtl:ml-1 ltr:mr-1" />
              <span>{service.avg_rating.toFixed(1)} ({service.review_count || 0} {tGlobal('reviews', {defaultValue: 'reviews'})})</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between items-center">
          <div className="text-lg font-semibold text-primary">
            {service.price.toLocaleString(locale, { style: 'currency', currency: service.currency, minimumFractionDigits: 0 })}
          </div>
          <Button size="sm" variant="outline" className="text-xs">
            {tGlobal('viewDetails', {defaultValue: "View Details"})} <ArrowRight className="rtl:mr-1 ltr:ml-1 h-3 w-3"/>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
