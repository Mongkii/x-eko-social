
// /api/admin/categories/[categoryId]
import { NextResponse } from 'next/server';
import { sampleCategoriesData from '@/lib/placeholder-data';
import type { MarketplaceCategory } from '@/lib/types';

// PUT to update a category
export async function PUT(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
    const data: Partial<MarketplaceCategory> = await request.json();
    console.log(`Admin: Update Category ${categoryId} Request (API):`, data);
    // In a real app:
    // 1. Validate admin auth
    // 2. Validate data
    // 3. Update category document in Firestore
    
    // Simulate update
    const index = sampleCategoriesData.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      // sampleCategoriesData[index] = { ...sampleCategoriesData[index], ...data };
      // Note: this in-memory update won't persist across requests in serverless.
    } else {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json({ message: 'Category updated successfully!', categoryId });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE a category (or mark inactive)
export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
    console.log(`Admin: Delete/Deactivate Category ${categoryId} Request (API)`);
    // In a real app:
    // 1. Validate admin auth
    // 2. Either delete document or set is_active = false in Firestore
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json({ message: 'Category status updated/deleted successfully!', categoryId });
  } catch (error) {
    console.error('Error deleting/deactivating category:', error);
    return NextResponse.json({ error: 'Failed to update category status' }, { status: 500 });
  }
}
