import { NextRequest, NextResponse } from 'next/server';
import { deleteClothingItem, updateClothingItem } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await updateClothingItem(id, body);
    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT /api/clothes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteClothingItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clothes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
