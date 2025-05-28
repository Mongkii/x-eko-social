
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sampleCategoriesData, sampleServicesData } from '@/lib/placeholder-data';
import type { MarketplaceCategory, MarketplaceService } from '@/lib/types';
import { Search, ArrowRight, CheckCircle, Users, FileText, Scale } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { useTranslations } from 'next-intl';
import { CategoryCard } from "@/components/category-card";
import { ServiceCard } from "@/components/service-card";

export default function MarketplaceHomePage() {
  const t = useTranslations('HomePage');
  const tGlobal = useTranslations('Global');

  // Simulate fetching featured services (e.g., first 4)
  const featuredServices = sampleServicesData.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background text-center">
          <div className="container">
            <Scale className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t('heroTitle')}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t('heroSubtitle')}</p>
            <div className="max-w-xl mx-auto">
              <form className="flex gap-2">
                <Input 
                  type="search" 
                  placeholder={tGlobal('searchPlaceholder')} 
                  className="flex-grow text-base" 
                  aria-label={tGlobal('searchPlaceholder')}
                />
                <Button type="submit" size="lg" className="text-base">
                  <Search className="rtl:ml-2 ltr:mr-2 h-5 w-5" /> {tGlobal('search')}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-semibold text-foreground">{t('categoriesTitle')}</h2>
              <Button variant="outline" asChild>
                <Link href="/services">{tGlobal('viewAll')} <ArrowRight className="rtl:mr-2 ltr:ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {sampleCategoriesData.filter(c => c.is_active).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Services Section */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-foreground">{t('featuredServicesTitle')}</h2>
              <Button variant="outline" asChild>
                <Link href="/services">{tGlobal('viewAll')} <ArrowRight className="rtl:mr-2 ltr:ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 text-center">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-foreground">{t('howItWorksTitle')}</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 mb-4 inline-flex">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('step1Title')}</h3>
                <p className="text-muted-foreground">{t('step1Description')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 mb-4 inline-flex">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('step2Title')}</h3>
                <p className="text-muted-foreground">{t('step2Description')}</p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="bg-primary/10 text-primary rounded-full p-4 mb-4 inline-flex">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('step3Title')}</h3>
                <p className="text-muted-foreground">{t('step3Description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Become a Provider CTA */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t('becomeProviderTitle')}</h2>
            <Button variant="secondary" size="lg" asChild className="text-lg bg-background/20 hover:bg-background/30 text-primary-foreground">
              <Link href="/provider/onboarding">{t('becomeProviderAction')}</Link>
            </Button>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
