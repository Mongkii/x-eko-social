
"use client";

import type { MarketplaceCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Link } from '@/navigation';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n';

interface CategoryCardProps {
  category: MarketplaceCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const locale = useLocale() as Locale;
  const categoryName = locale === 'ar' ? category.name_ar : category.name_en;
  const categoryDescription = locale === 'ar' ? category.description_ar : category.description_en;

  return (
    <Link href={`/services/${category.id}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0 relative aspect-[4/3] w-full">
          <Image
            src={category.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(categoryName)}`}
            alt={categoryName}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={category.dataAiHint || "legal services"}
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-md font-semibold mb-1 line-clamp-2">{categoryName}</CardTitle>
          {categoryDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2">{categoryDescription}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
