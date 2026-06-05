import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const outfits = await prisma.outfit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = outfits.map((o) => ({
      ...o,
      itemIds: JSON.parse(o.itemIds || '[]'),
      poseImages: JSON.parse(o.poseImages || '[]'),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('GET /api/outfits error:', error);
    return NextResponse.json({ error: 'Failed to fetch outfits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const outfit = await prisma.outfit.create({
      data: {
        userId: body.userId,
        name: body.name || null,
        itemIds: JSON.stringify(body.itemIds || []),
        style: body.style,
        season: body.season,
        weatherType: body.weatherType || null,
        cityName: body.cityName || null,
        temperature: body.temperature || null,
        prompt: body.prompt || null,
        outfitDesc: body.outfitDesc || null,
        generatedImage: body.generatedImage || null,
        poseImages: JSON.stringify(body.poseImages || []),
      },
    });

    return NextResponse.json({
      ...outfit,
      itemIds: JSON.parse(outfit.itemIds || '[]'),
      poseImages: JSON.parse(outfit.poseImages || '[]'),
    });
  } catch (error) {
    console.error('POST /api/outfits error:', error);
    return NextResponse.json({ error: 'Failed to create outfit' }, { status: 500 });
  }
}
