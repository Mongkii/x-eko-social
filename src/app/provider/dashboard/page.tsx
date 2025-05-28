
"use client";
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ListChecks, BarChart3, UserCog, CalendarClock } from 'lucide-react';

export default function ProviderDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onPersonalizeFeed={() => {}} />
      <main className="flex-grow container py-8">
        <h1 className="text-3xl font-bold mb-8">لوحة تحكم مقدم الخدمة</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إدارة خدماتي</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 خدمة</div>
              <p className="text-xs text-muted-foreground">+3 نشطة هذا الشهر</p>
              <Button size="sm" className="mt-4" asChild><Link href="/provider/services">إدارة</Link></Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات النشطة</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 طلبات نشطة</div>
              <p className="text-xs text-muted-foreground">2 جديدة منذ آخر تسجيل دخول</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/orders">عرض الطلبات</Link></Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأرباح</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350.00 ر.س</div>
              <p className="text-xs text-muted-foreground">هذا الشهر</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/earnings">عرض المدفوعات</Link></Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ملفي الشخصي</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <p className="text-xs text-muted-foreground">تحديث سيرتك الذاتية، مؤهلاتك، وخدماتك.</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/profile/edit">تعديل الملف الشخصي</Link></Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أوقات التوفر</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">إدارة ساعات العمل وأيام الإجازات.</p>
               <Button size="sm" className="mt-4" asChild><Link href="/provider/availability">ضبط التقويم</Link></Button>
            </CardContent>
          </Card>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}

