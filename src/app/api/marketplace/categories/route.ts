
// /api/marketplace/categories
import { NextResponse } from 'next/server';
import { sampleCategoriesData } from '@/lib/placeholder-data';

export async function GET(request: Request) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return NextResponse.json(sampleCategoriesData.filter(c => c.is_active));
}
