import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');

    if (!city) {
      return NextResponse.json({ error: 'city is required' }, { status: 400 });
    }

    const weather = await getWeather(city, lat, lon);
    return NextResponse.json(weather);
  } catch (error) {
    console.error('GET /api/weather error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
