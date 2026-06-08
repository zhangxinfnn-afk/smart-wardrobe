import { NextRequest, NextResponse } from 'next/server';
import { getOutfits, createOutfit } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    const outfits = await getOutfits(userId);
    const parsed = outfits.map((o: Record<string, unknown>) => ({
      ...o,
      itemIds: typeof o.itemIds === 'string' ? JSON.parse(o.itemIds as string) : (o.itemIds || []),
      poseImages: typeof o.poseImages === 'string' ? JSON.parse(o.poseImages as string) : (o.poseImages || []),
    }));
    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const outfit = await createOutfit(body);
    return NextResponse.json(outfit);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
