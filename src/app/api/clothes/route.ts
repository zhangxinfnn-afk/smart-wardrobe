import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'clothes');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const season = searchParams.get('season');
    const style = searchParams.get('style');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    const items = await prisma.clothingItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON strings and filter in app if needed
    const parsed = items.map((item) => ({
      ...item,
      colors: JSON.parse(item.colors || '[]'),
      season: JSON.parse(item.season || '[]'),
      style: JSON.parse(item.style || '[]'),
    }));

    // Filter by season/style if specified (since they're JSON arrays in SQLite)
    let filtered = parsed;
    if (season && season !== 'ALL') {
      filtered = filtered.filter((item) => item.season.includes(season));
    }
    if (style && style !== 'ALL') {
      filtered = filtered.filter((item) => item.style.includes(style));
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('GET /api/clothes error:', error);
    return NextResponse.json({ error: 'Failed to fetch clothes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const dataStr = formData.get('data') as string;

    if (!dataStr) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    const data = JSON.parse(dataStr);

    // Handle image upload
    let imageUrl = data.imageUrl || '';
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${ext}`;

      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(join(UPLOAD_DIR, filename), buffer);
      imageUrl = `/uploads/clothes/${filename}`;
    }

    const item = await prisma.clothingItem.create({
      data: {
        userId: data.userId,
        category: data.category,
        subcategory: data.subcategory || null,
        name: data.name,
        color: data.color || null,
        colors: JSON.stringify(data.colors || []),
        material: data.material || null,
        season: JSON.stringify(data.season || []),
        style: JSON.stringify(data.style || []),
        brand: data.brand || null,
        imageUrl,
        isFavorite: data.isFavorite || false,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({
      ...item,
      colors: JSON.parse(item.colors || '[]'),
      season: JSON.parse(item.season || '[]'),
      style: JSON.parse(item.style || '[]'),
    });
  } catch (error) {
    console.error('POST /api/clothes error:', error);
    return NextResponse.json({ error: 'Failed to create clothing item' }, { status: 500 });
  }
}
