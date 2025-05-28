
"use client";
import { useTranslations } from 'next-intl';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Briefcase, ListChecks, BarChart3, UserCog, CalendarClock } from 'lucide-react';

export default function ProviderDashboardPage() {
  const t = useTranslations('ProviderDashboardPage');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container py-8">
        <h1 className="text-3xl font-bold mb-8">{t('pageTitle')}</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('manageServices')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 Services</div>
              <p className="text-xs text-muted-foreground">+3 active this month</p>
              <Button size="sm" className="mt-4" asChild><Link href="/provider/services">Manage</Link></Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('activeOrders')}</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Active Orders</div>
              <p className="text-xs text-muted-foreground">2 new since last login</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/orders">View Orders</Link></Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('earnings')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,350.00</div>
              <p className="text-xs text-muted-foreground">This month</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/earnings">View Payouts</Link></Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('myProfile')}</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <p className="text-xs text-muted-foreground">Update your bio, qualifications, and services.</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/profile/edit">Edit Profile</Link></Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('availability')}</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage your working hours and vacation days.</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/availability">Set Calendar</Link></Button>
            </CardContent>
          </Card>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
