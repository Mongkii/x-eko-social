
"use client";
import { useTranslations } from 'next-intl';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ListOrdered, FileText } from 'lucide-react';

export default function UserDashboardPage() {
  const t = useTranslations('UserDashboardPage');
  const tGlobal = useTranslations('Global');

  // Simulated data
  const orders = [
    { id: 'ORD123', serviceName: 'Will Drafting', status: 'Completed', date: '2023-10-15' },
    { id: 'ORD124', serviceName: 'Business Consultation', status: 'In Progress', date: '2023-11-01' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container py-8">
        <h1 className="text-3xl font-bold mb-8">{t('pageTitle')}</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListOrdered className="mr-2 h-5 w-5 text-primary" />
                {t('myOrdersTitle')}
              </CardTitle>
              <CardDescription>View and manage your service orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <ul className="space-y-4">
                  {orders.map(order => (
                    <li key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{order.serviceName} ({order.id})</p>
                        <p className="text-sm text-muted-foreground">{t('status')}: {order.status} - {t('dateBooked')}: {order.date}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>{t('viewOrder')}</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{t('noOrders')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                My Documents
              </CardTitle>
               <CardDescription>Access and manage your uploaded documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document management feature coming soon.</p>
              <Button className="mt-4">Upload New Document</Button>
            </CardContent>
          </Card>
        </div>
        
      </main>
      <AppFooter />
    </div>
  );
}
