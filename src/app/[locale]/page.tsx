
"use client";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, ArrowRight, CheckCircle, Users, FileText, Scale, Star } from 'lucide-react'; // Added Scale for legal, Star
import { sampleCategoriesData, sampleServicesData } from '@/lib/placeholder-data'; // Corrected import names
import Image from 'next/image';
import { Link } from '@/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer'; 
import type { MarketplaceCategory, MarketplaceService } from '@/lib/types';
import { useLocale } from 'next-intl';

function CategoryCard({ category }: { category: MarketplaceCategory }) {
  const tGlobal = useTranslations('Global');
  const locale = useLocale();
  const categoryName = locale === 'ar' ? category.name_ar : category.name_en;
  const categoryDescription = locale === 'ar' ? category.description_ar : category.description_en;

  return (
    <Link href={`/services/${category.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="p-0 relative aspect-video">
          <Image
            src={category.imageUrl || "https://placehold.co/600x338.png"} // Adjusted aspect ratio
            alt={categoryName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={category.dataAiHint || 'legal abstract professional'}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-semibold mb-1">{categoryName}</h3>
          {categoryDescription && <p className="text-sm text-muted-foreground line-clamp-3">{categoryDescription}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button variant="link" className="p-0 h-auto text-primary">
              {tGlobal('viewDetails')} <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

function ServiceCard({ service }: { service: MarketplaceService }) {
  const tGlobal = useTranslations('Global');
  const locale = useLocale();
  const serviceTitle = locale === 'ar' ? service.title_ar : service.title_en;

  return (
    <Link href={`/service/${service.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="p-0 relative aspect-video">
          <Image
            src={service.main_image_url || "https://placehold.co/600x338.png"} // Adjusted aspect ratio
            alt={serviceTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={service.dataAiHint || 'legal service item'}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-md font-semibold mb-1 line-clamp-2">{serviceTitle}</h3>
          <p className="text-sm text-muted-foreground mb-2">{service.provider_name}</p>
          <p className="text-lg font-bold text-primary mb-2">{service.price} <span className="text-xs font-normal">{service.currency}</span></p>
          {service.avg_rating && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
              {service.avg_rating.toFixed(1)} ({tGlobal('reviewsCount', { count: service.review_count || 0 })})
            </div>
          )}
        </CardContent>
         <CardFooter className="p-4 pt-0">
            <Button variant="link" size="sm" className="p-0 h-auto text-primary">
              {tGlobal('viewDetails')} <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default function MarketplaceHomepage() {
  const t = useTranslations('MarketplaceHomepage');
  const tGlobal = useTranslations('Global');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24 text-center">
          <div className="container">
            <Scale className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">{t('heroTitle')}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">{t('heroSubtitle')}</p>
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="search"
                placeholder={tGlobal('searchPlaceholder')}
                className="h-14 text-lg pl-12 pr-4 rounded-full shadow-lg focus-visible:ring-primary"
              />
              <Search className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="text-3xl font-bold mb-10 text-center">{t('categoriesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {sampleCategoriesData.filter(c => c.is_active).slice(0,3).map(category => ( // Show top 3 categories, corrected variable name
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
             <div className="text-center mt-10">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/services">{tGlobal('allCategories')} <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" /></Link>
                </Button>
              </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold mb-10 text-center">{t('featuredServicesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {sampleServicesData.slice(0, 4).map(service => ( // Corrected variable name
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
             <div className="text-center mt-10">
                <Button size="lg" asChild>
                  <Link href="/services">{tGlobal('allServices')} <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" /></Link>
                </Button>
              </div>
          </div>
        </section>
        
        <section className="py-12 md:py-20">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center">{t('howItWorksTitle')}</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">
              <div className="flex flex-col items-center p-6 rounded-lg ">
                <div className="bg-primary/10 text-primary rounded-full p-5 mb-5 inline-flex">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('step1Browse')}</h3>
                <p className="text-muted-foreground text-sm">{t('step1Desc')}</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-lg ">
                <div className="bg-primary/10 text-primary rounded-full p-5 mb-5 inline-flex">
                  <FileText className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('step2Book')}</h3>
                <p className="text-muted-foreground text-sm">{t('step2Desc')}</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-lg ">
                <div className="bg-primary/10 text-primary rounded-full p-5 mb-5 inline-flex">
                  <Users className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('step3Collaborate')}</h3>
                <p className="text-muted-foreground text-sm">{t('step3Desc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}

