
// /api/marketplace/services
import { NextResponse } from 'next/server';
import { sampleServicesData, sampleCategoriesData } from '@/lib/placeholder-data';
import type { MarketplaceService } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const searchQuery = searchParams.get('q')?.toLowerCase();
  // Add other filters like price, rating, location later

  let services = sampleServicesData;

  if (categoryId && categoryId !== 'all') {
    services = services.filter(service => service.category_id === categoryId);
  }

  if (searchQuery) {
    services = services.filter(service => 
      service.title_en.toLowerCase().includes(searchQuery) ||
      service.title_ar.toLowerCase().includes(searchQuery) ||
      (service.description_en && service.description_en.toLowerCase().includes(searchQuery)) ||
      (service.description_ar && service.description_ar.toLowerCase().includes(searchQuery)) ||
      (service.provider_name && service.provider_name.toLowerCase().includes(searchQuery))
    );
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(services);
}
