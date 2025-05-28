
"use client";
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListOrdered, FileText } from 'lucide-react';

export default function UserDashboardPage() {
  // Simulated data
  const orders = [
    { id: 'ORD123', serviceName: 'صياغة وصية', status: 'مكتمل', date: '2023-10-15' },
    { id: 'ORD124', serviceName: 'استشارة أعمال', status: 'قيد التنفيذ', date: '2023-11-01' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onPersonalizeFeed={() => {}} />
      <main className="flex-grow container py-8">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم الخاصة بي</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListOrdered className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5 text-primary" />
                طلباتي للخدمات
              </CardTitle>
              <CardDescription>عرض وإدارة طلبات الخدمات الخاصة بك.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <ul className="space-y-4">
                  {orders.map(order => (
                    <li key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{order.serviceName} ({order.id})</p>
                        <p className="text-sm text-muted-foreground">الحالة: {order.status} - تاريخ الحجز: {order.date}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>عرض الطلب</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">لم تقم بحجز أي خدمات بعد. استكشف السوق للبدء!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5 text-primary" />
                مستنداتي
              </CardTitle>
               <CardDescription>الوصول إلى المستندات التي تم تحميلها وإدارتها.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">ميزة إدارة المستندات ستتوفر قريبًا.</p>
              <Button className="mt-4">تحميل مستند جديد</Button>
            </CardContent>
          </Card>
        </div>
        
      </main>
      <AppFooter />
    </div>
  );
}
