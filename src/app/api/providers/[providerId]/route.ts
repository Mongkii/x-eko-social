
// /api/providers/[providerId]
import { NextResponse } from 'next/server';
import { sampleProvidersData from '@/lib/placeholder-data';
import type { LegalProvider } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { providerId: string } }
) {
  const providerId = params.providerId;
  const provider = sampleProvidersData.find(p => p.id === providerId);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  if (provider) {
    return NextResponse.json(provider);
  } else {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }
}
