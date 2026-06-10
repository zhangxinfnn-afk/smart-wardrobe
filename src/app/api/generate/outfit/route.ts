import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getClothes, createOutfit } from '@/lib/db';
import { buildOutfitPrompt, parseAIResponse } from '@/lib/ai';
import { generateImage } from '@/lib/replicate';
import type { WeatherData, Style, ClothingItem, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cityName, style, weather } = body as {
      userId: string;
      cityName: string;
      style: Style;
      weather: WeatherData;
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get user
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's clothes
    const rawClothes = await getClothes(userId);
    if (rawClothes.length === 0) {
      return NextResponse.json(
        { error: '衣帽间为空，请先添加衣物' },
        { status: 400 }
      );
    }

    const parsedClothes = (rawClothes as Record<string, unknown>[]).map((item: Record<string, unknown>) => ({
      ...item,
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors as string) : (item.colors || []),
      season: typeof item.season === 'string' ? JSON.parse(item.season as string) : (item.season || []),
      style: typeof item.style === 'string' ? JSON.parse(item.style as string) : (item.style || []),
    })) as unknown as ClothingItem[];

    // Filter clothes by season and style
    const seasonFiltered = parsedClothes.filter(
      (item) =>
        item.season.length === 0 ||
        item.season.includes(weather.season)
    );

    const clothesToUse =
      seasonFiltered.length >= 3 ? seasonFiltered : parsedClothes;

    // Build prompt and call Claude API (pass full user object for body data)
    const userObj = user as unknown as User;
    const prompt = buildOutfitPrompt(clothesToUse, weather, style, userObj);

    let outfitData: {
      selectedItems: { id: string; reason: string }[];
      outfitDescription: string;
      sdPrompt: string;
    };

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && anthropicKey !== 'your_anthropic_key' && anthropicKey.startsWith('sk-ant-')) {
      // Real AI call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content[0]?.text || '';
      const parsed = parseAIResponse(text);

      if (parsed) {
        outfitData = parsed as typeof outfitData;
      } else {
        throw new Error('Failed to parse AI response');
      }
    } else {
      // Mock AI recommendation (no API key configured)
      outfitData = generateMockOutfit(clothesToUse, weather, style, userObj);
    }

    // Generate image with Stable Diffusion
    let generatedImageUrl: string | null = null;
    try {
      generatedImageUrl = await generateImage(outfitData.sdPrompt);
    } catch {
      console.log('Image generation failed, continuing without image');
    }

    // Save outfit to database
    const outfit = await createOutfit({
      userId,
      name: `${weather.city} ${style}穿搭`,
      itemIds: outfitData.selectedItems.map((i) => i.id),
      style: style,
      season: weather.season,
      weatherType: weather.description,
      cityName,
      temperature: weather.temperature,
      prompt: outfitData.sdPrompt,
      outfitDesc: outfitData.outfitDescription,
      generatedImage: generatedImageUrl,
      poseImages: [],
    });

    return NextResponse.json({
      id: outfit.id,
      selectedItems: outfitData.selectedItems,
      outfitDescription: outfitData.outfitDescription,
      sdPrompt: outfitData.sdPrompt,
      generatedImageUrl,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('POST /api/generate/outfit error:', msg);
    return NextResponse.json(
      { error: `搭配生成失败: ${msg}` },
      { status: 500 }
    );
  }
}

function generateMockOutfit(
  clothes: ClothingItem[],
  weather: WeatherData,
  style: string,
  user?: User
) {
  const tops = clothes.filter((c) => c.category === 'TOP' || c.category === 'DRESS');
  const bottoms = clothes.filter((c) => c.category === 'BOTTOM');
  const shoes = clothes.filter((c) => c.category === 'SHOES');
  const accessories = clothes.filter((c) =>
    ['SCARF', 'BELT', 'HAT', 'JEWELRY', 'GLASSES', 'BAG'].includes(c.category)
  );

  const pick = (arr: ClothingItem[]) =>
    arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  const top = pick(tops);
  const bottom = pick(bottoms);
  const shoe = pick(shoes);
  const acc = pick(accessories);

  const selectedItems = [top, bottom, shoe, acc]
    .filter(Boolean)
    .map((item) => ({
      id: item!.id,
      reason: '完美匹配今日风格与天气',
    }));

  const descParts = [];
  if (top) descParts.push(`${top.color || ''}${top.name}`);
  if (bottom) descParts.push(`搭配${bottom.name}`);
  if (shoe) descParts.push(`脚穿${shoe.name}`);
  if (acc) descParts.push(`配以${acc.name}`);

  // 根据用户身材调整描述
  const heightText = user?.height ? `${user.height}cm` : '';
  const bodyText = user?.bodyType || '标准';
  const appearance = `${heightText} ${bodyText}身材`;

  const outfitDescription = descParts.join('，') +
    `，整体呈现${style}风格，非常适合${appearance}的${user?.name || '用户'}在${weather.description}的${weather.temperature}°C天气穿着`;

  // 根据用户性别和外貌构建 SD prompt
  const genderEn = user?.gender === 'female' ? 'woman' : user?.gender === 'male' ? 'man' : 'person';
  const ageStr = user?.age ? ` ${user.age}-year-old` : '';
  const sdPrompt = `A${ageStr} ${genderEn} with ${appearance} body type wearing ${outfitDescription}, full body shot, ${style} style outfit, ${weather.description} weather, natural outdoor lighting, fashion photography, high quality, 8k, detailed clothing texture`;

  return { selectedItems, outfitDescription, sdPrompt };
}
