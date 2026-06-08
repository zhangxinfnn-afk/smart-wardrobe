import { NextRequest, NextResponse } from 'next/server';
import { createClothingItem } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const dataStr = formData.get('data') as string;
    if (!dataStr) return NextResponse.json({ error: 'data required' }, { status: 400 });

    const { userId, items: itemDataList } = JSON.parse(dataStr);

    const results = [];
    for (let i = 0; i < itemDataList.length; i++) {
      const itemData = itemDataList[i] || {};
      const file = files[i];

      // 图片转 base64
      let imageUrl = '';
      if (file) {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const mime = file.type || 'image/jpeg';
        imageUrl = `data:${mime};base64,${base64}`;
      }

      const item = await createClothingItem({
        userId,
        category: itemData.category || 'TOP',
        subcategory: itemData.subcategory || null,
        name: itemData.name || `Item ${i + 1}`,
        color: itemData.color || null,
        colors: itemData.colors || [],
        season: itemData.season || [],
        style: itemData.style || [],
        imageUrl,
      });
      results.push(item);
    }

    return NextResponse.json({ items: results, count: results.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
