import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'clothes');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const dataStr = formData.get('data') as string;

    if (!dataStr) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    const { userId, items: itemDataList } = JSON.parse(dataStr);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const itemData = itemDataList[i] || {};

      // Upload image
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      await writeFile(join(UPLOAD_DIR, filename), buffer);
      const imageUrl = `/uploads/clothes/${filename}`;

      // Create clothing item
      const item = await prisma.clothingItem.create({
        data: {
          userId: userId,
          category: itemData.category || 'TOP',
          subcategory: itemData.subcategory || null,
          name: itemData.name || file.name.replace(/\.[^.]+$/, ''),
          color: itemData.color || null,
          colors: JSON.stringify(itemData.colors || []),
          material: itemData.material || null,
          season: JSON.stringify(itemData.season || []),
          style: JSON.stringify(itemData.style || []),
          brand: itemData.brand || null,
          imageUrl,
          notes: itemData.notes || null,
        },
      });

      results.push({
        ...item,
        colors: JSON.parse(item.colors || '[]'),
        season: JSON.parse(item.season || '[]'),
        style: JSON.parse(item.style || '[]'),
      });
    }

    return NextResponse.json({ items: results, count: results.length });
  } catch (error) {
    console.error('POST /api/clothes/batch error:', error);
    return NextResponse.json({ error: 'Failed to batch upload' }, { status: 500 });
  }
}
