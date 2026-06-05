import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.clothingItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...item,
      colors: JSON.parse(item.colors || '[]'),
      season: JSON.parse(item.season || '[]'),
      style: JSON.parse(item.style || '[]'),
    });
  } catch (error) {
    console.error('GET /api/clothes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.clothingItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = await prisma.clothingItem.update({
      where: { id },
      data: {
        category: body.category ?? existing.category,
        subcategory: body.subcategory ?? existing.subcategory,
        name: body.name ?? existing.name,
        color: body.color ?? existing.color,
        colors: body.colors ? JSON.stringify(body.colors) : existing.colors,
        material: body.material ?? existing.material,
        season: body.season ? JSON.stringify(body.season) : existing.season,
        style: body.style ? JSON.stringify(body.style) : existing.style,
        brand: body.brand ?? existing.brand,
        isFavorite: body.isFavorite ?? existing.isFavorite,
        notes: body.notes ?? existing.notes,
      },
    });

    return NextResponse.json({
      ...item,
      colors: JSON.parse(item.colors || '[]'),
      season: JSON.parse(item.season || '[]'),
      style: JSON.parse(item.style || '[]'),
    });
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
    await prisma.clothingItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clothes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
