
// /api/services/[serviceId]
import { NextResponse } from 'next/server';
import { sampleServicesData, sampleProvidersData, sampleReviewsData } from '@/lib/placeholder-data';
import type { MarketplaceService, LegalProvider, ServiceReview } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  const serviceId = params.serviceId;
  const service = sampleServicesData.find(s => s.id === serviceId);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  if (service) {
    const provider = sampleProvidersData.find(p => p.id === service.provider_id);
    const reviews = sampleReviewsData.filter(r => r.service_id === serviceId);
    return NextResponse.json({ service, provider, reviews });
  } else {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
}
