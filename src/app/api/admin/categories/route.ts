
// /api/admin/categories
import { NextResponse } from 'next/server';
import { sampleCategoriesData } from '@/lib/placeholder-data';
import type { MarketplaceCategory } from '@/lib/types';

// GET all categories (for admin panel)
export async function GET(request: Request) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return NextResponse.json(sampleCategoriesData); // Return all, including inactive
}

// POST to create a new category
export async function POST(request: Request) {
  try {
    const data: Partial<MarketplaceCategory> = await request.json();
    console.log('Admin: Create Category Request (API):', data);
    // In a real app:
    // 1. Validate admin auth
    // 2. Validate data
    // 3. Create category document in Firestore
    const newCategory: MarketplaceCategory = {
      id: `cat_${Date.now()}`,
      name_en: data.name_en || 'New Category',
      name_ar: data.name_ar || 'فئة جديدة',
      description_en: data.description_en || '',
      description_ar: data.description_ar || '',
      is_active: data.is_active !== undefined ? data.is_active : true,
      imageUrl: data.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(data.name_en || 'New'))}`,
    };
    // sampleCategoriesData.push(newCategory); // Simulate add for demo (won't persist)
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json({ message: 'Category created successfully!', category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
