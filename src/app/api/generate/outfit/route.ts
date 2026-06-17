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

    // 收集人物照片
    const userPhoto = (user as Record<string, unknown>).frontPhoto as string | undefined;

    // 收集选中衣物的照片（base64），按上装→下装→鞋子排序
    const clothingPhotos: string[] = [];
    const selectedIds = outfitData.selectedItems.map((i) => i.id);
    const order = ['TOP', 'DRESS', 'OUTERWEAR', 'BOTTOM', 'SHOES', 'BAG', 'SCARF', 'BELT', 'HAT', 'JEWELRY', 'GLASSES'];
    const sorted = [...parsedClothes].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    for (const item of sorted) {
      if (selectedIds.includes(item.id)) {
        const url = ((item as Record<string, unknown>).imageUrl as string) || '';
        if (url.startsWith('data:')) clothingPhotos.push(url);
      }
    }

    // 生成 prompt（和豆包网页端一致）
    const clothingCount = clothingPhotos.length;
    const clothingRefs = Array.from({ length: clothingCount }, (_, i) => `图${i + 2}`).join('、');
    const imgPrompt = `把图1中的人物穿上${clothingRefs}的衣服鞋子，模拟生成人物穿搭照片`;

    // 用 豆包 生成
    let generatedImageUrl: string | null = null;
    try {
      generatedImageUrl = await generateImage(imgPrompt, userPhoto || undefined, clothingPhotos.length > 0 ? clothingPhotos : undefined);
    } catch {
      console.log('Image generation failed');
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

  // DALL-E prompt：描述人物穿着指定衣服的时尚照片
  const genderEn = user?.gender === 'female' ? 'a Chinese woman' : user?.gender === 'male' ? 'a Chinese man' : 'a person';
  const ageStr = user?.age ? ` ${user.age}-year-old` : '';
  const heightStr = user?.height ? ` ${user.height}cm tall` : '';
  const bodyMap: Record<string, string> = { SLIM:'slim', FIT:'fit athletic', AVERAGE:'average', PLUMP:'curvy', MUSCULAR:'muscular', PETITE:'petite short', TALL:'tall' };
  const bodyStr = user?.bodyType && bodyMap[user.bodyType] ? ` with ${bodyMap[user.bodyType]} build` : '';

  // 清理衣物名称
  const cleanName = (s: string) => s.replace(/\.[^.]+$/, '').replace(/[~_\-]/g, ' ').replace(/\s+/g, ' ').trim();

  const clothingDesc = descParts.map(p => cleanName(p)).join(', ');
  const appearanceDesc = [ageStr, heightStr, bodyStr].filter(Boolean).join(', ');

  // DALL-E 优化 prompt（英文）
  const sdPrompt = `A full-body fashion photo of ${genderEn}${appearanceDesc ? ', ' + appearanceDesc : ''}, wearing ${clothingDesc}. ${style} casual chic outfit. Standing pose, ${weather.description} weather outdoor background, street style fashion photography, natural daylight, sharp focus, editorial quality, full body visible from head to toe`;

  return { selectedItems, outfitDescription, sdPrompt };
}
