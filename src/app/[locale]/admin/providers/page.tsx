
"use client";

import { useState, useEffect } from 'react';
import type { LegalProvider } from '@/lib/types'; // Assuming you have this type
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminProvidersPage() {
  const t = useTranslations('AdminProvidersPage');
  const tGlobal = useTranslations('Global');
  const [providers, setProviders] = useState<LegalProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching providers
  useEffect(() => {
    async function fetchProviders() {
      setIsLoading(true);
      // In a real app, fetch from your API: e.g., /api/admin/providers
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      const mockProviders: LegalProvider[] = [
        { id: 'prov1', user_id: 'user1', name: 'شركة المحاماة الدولية', status: 'pending', country_code: 'SA', city: 'الرياض', member_since: new Date(2023, 0, 15).toISOString() },
        { id: 'prov2', user_id: 'user2', name: 'مكتب استشارات قانونية', status: 'approved', country_code: 'AE', city: 'دبي', member_since: new Date(2022, 5, 10).toISOString(), overall_rating: 4.5, total_reviews: 20 },
        { id: 'prov3', user_id: 'user3', name: 'المستشار القانوني فلان', status: 'suspended', country_code: 'SA', city: 'جدة', member_since: new Date(2023, 2, 1).toISOString() },
      ];
      setProviders(mockProviders);
      setIsLoading(false);
    }
    fetchProviders();
  }, []);

  const handleProviderAction = async (providerId: string, action: 'approve' | 'reject' | 'suspend') => {
    // Simulate API call
    console.log(`Admin action: ${action} provider ${providerId}`);
    try {
      // const response = await fetch('/api/admin/approve', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ providerId, action }),
      // });
      // if (!response.ok) throw new Error(`Failed to ${action} provider`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      toast({ title: t('actionSuccessTitle', {defaultValue: "Success"}), description: t('providerStatusUpdated', {providerId, status: action}) });
      // Update local state or re-fetch
      setProviders(prev => 
        prev.map(p => p.id === providerId ? { ...p, status: action as LegalProvider['status'] } : p)
      );
    } catch (error) {
      console.error(`Error ${action} provider:`, error);
      toast({ title: t('actionErrorTitle', {defaultValue: "Error"}), description: t('errorUpdatingProvider'), variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">{tGlobal('loading')}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pageTitle')}</CardTitle>
        <CardDescription>{t('description', {defaultValue: "Approve, reject, or suspend service provider applications."})}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('providerNameHeader', {defaultValue: "Provider Name"})}</TableHead>
              <TableHead>{t('statusHeader', {defaultValue: "Status"})}</TableHead>
              <TableHead>{t('locationHeader', {defaultValue: "Location"})}</TableHead>
              <TableHead>{t('memberSinceHeader', {defaultValue: "Member Since"})}</TableHead>
              <TableHead className="text-right">{t('actionsHeader', {defaultValue: "Actions"})}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.name}</TableCell>
                <TableCell>
                  <Badge variant={
                    provider.status === 'approved' ? 'default' :
                    provider.status === 'pending' ? 'secondary' :
                    'destructive'
                  } className={
                    provider.status === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                    provider.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    'bg-red-500 hover:bg-red-600'
                  }>
                    {provider.status === 'approved' && <CheckCircle className="rtl:ml-1 ltr:mr-1 h-3 w-3" />}
                    {provider.status === 'pending' && <Clock className="rtl:ml-1 ltr:mr-1 h-3 w-3" />}
                    {provider.status === 'suspended' && <XCircle className="rtl:ml-1 ltr:mr-1 h-3 w-3" />}
                    {tGlobal(`status${provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}` as any, { defaultValue: provider.status })}
                  </Badge>
                </TableCell>
                <TableCell>{provider.city}, {provider.country_code}</TableCell>
                <TableCell>{provider.member_since ? new Date(provider.member_since).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {provider.status !== 'approved' && (
                        <DropdownMenuItem onClick={() => handleProviderAction(provider.id, 'approve')}>
                           <CheckCircle className="rtl:ml-2 ltr:mr-2 h-4 w-4 text-green-500" /> {t('approveAction')}
                        </DropdownMenuItem>
                      )}
                      {provider.status !== 'rejected' && provider.status !== 'pending' && ( // Assuming reject is final, or re-apply
                         <DropdownMenuItem onClick={() => handleProviderAction(provider.id, 'reject')} className="text-destructive">
                           <XCircle className="rtl:ml-2 ltr:mr-2 h-4 w-4" /> {t('rejectAction')}
                        </DropdownMenuItem>
                      )}
                       {provider.status === 'approved' && (
                        <DropdownMenuItem onClick={() => handleProviderAction(provider.id, 'suspend')} className="text-destructive">
                           <Clock className="rtl:ml-2 ltr:mr-2 h-4 w-4" /> {t('suspendAction')}
                        </DropdownMenuItem>
                      )}
                       {provider.status === 'suspended' && (
                        <DropdownMenuItem onClick={() => handleProviderAction(provider.id, 'approve')}>
                           <CheckCircle className="rtl:ml-2 ltr:mr-2 h-4 w-4 text-green-500" /> {t('reinstateAction', {defaultValue: "Reinstate"})}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {providers.length === 0 && <p className="text-center text-muted-foreground py-4">{t('noProvidersFound', {defaultValue: "No providers found."})}</p>}
      </CardContent>
    </Card>
  );
}
