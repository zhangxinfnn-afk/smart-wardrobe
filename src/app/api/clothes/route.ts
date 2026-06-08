import { NextRequest, NextResponse } from 'next/server';
import { getClothes, createClothingItem } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let items = await getClothes(userId, category || undefined);

    // Parse JSON fields and filter
    items = items.map((item: Record<string, unknown>) => ({
      ...item,
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors as string) : (item.colors || []),
      season: typeof item.season === 'string' ? JSON.parse(item.season as string) : (item.season || []),
      style: typeof item.style === 'string' ? JSON.parse(item.style as string) : (item.style || []),
    }));

    const season = searchParams.get('season');
    const style = searchParams.get('style');

    if (season && season !== 'ALL') {
      items = items.filter((item: { season: string[] }) => item.season?.includes(season));
    }
    if (style && style !== 'ALL') {
      items = items.filter((item: { style: string[] }) => item.style?.includes(style));
    }

    return NextResponse.json(items);
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

    // 图片转 base64 存储（Netlify 无文件系统）
    let imageUrl = data.imageUrl || '';
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mime = imageFile.type || 'image/jpeg';
      imageUrl = `data:${mime};base64,${base64}`;
    }

    const item = await createClothingItem({
      userId: data.userId,
      category: data.category,
      subcategory: data.subcategory || null,
      name: data.name,
      color: data.color || null,
      colors: data.colors || [],
      material: data.material || null,
      season: data.season || [],
      style: data.style || [],
      brand: data.brand || null,
      imageUrl,
      notes: data.notes || null,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('POST /api/clothes error:', error);
    return NextResponse.json({ error: 'Failed to create clothing item' }, { status: 500 });
  }
}
