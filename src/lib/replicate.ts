/**
 * AI 图片生成 — 豆包 Seedream 虚拟试穿
 * 文档: https://www.volcengine.com/docs/6492/2172373
 */

const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

export async function generateImage(
  prompt: string,
  personPhoto?: string,
  clothingPhotos?: string[],
  count: number = 1
): Promise<string | null> {
  if (count > 1) {
    // 批量生成
    const results = await generateMultiple(prompt, personPhoto, clothingPhotos, count);
    return results[0] || null;
  }
  return generateSingle(prompt, personPhoto, clothingPhotos);
}

async function generateSingle(
  prompt: string,
  personPhoto?: string,
  clothingPhotos?: string[]
): Promise<string | null> {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) return null;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    // 参考图数组：人物在前，衣服在后（对应 prompt 中"图1""图2"）
    const images: string[] = [];
    if (personPhoto) images.push(personPhoto);
    if (clothingPhotos?.length) images.push(...clothingPhotos.filter(Boolean));

    const body: Record<string, unknown> = {
      model: 'doubao-seedream-4-5-251128',
      prompt: prompt.slice(0, 2000),
      n: 1,
      size: '1920x1920',
      watermark: false,
      response_format: 'url',
    };

    if (images.length > 0) {
      body.image = images;
      body.optimize_prompt_options = { mode: 'standard' };
    }

    const res = await fetch(ARK_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Seedream]', JSON.stringify(err).slice(0, 400));
      return null;
    }
    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch (e) {
    console.error('[Seedream]', e);
    return null;
  }
}

async function generateMultiple(
  prompt: string,
  personPhoto?: string,
  clothingPhotos?: string[],
  count: number = 4
): Promise<string[]> {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) return [];
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const images: string[] = [];
  if (personPhoto) images.push(personPhoto);
  if (clothingPhotos?.length) images.push(...clothingPhotos.filter(Boolean));

  try {
    const body: Record<string, unknown> = {
      model: 'doubao-seedream-4-5-251128',
      prompt: prompt.slice(0, 2000),
      n: count,
      size: '1920x1920',
      watermark: false,
      response_format: 'url',
      sequential_image_generation: 'auto',
      sequential_image_generation_options: { max_images: count },
    };
    if (images.length > 0) body.image = images;

    const res = await fetch(ARK_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const d = await res.json();
      return (d.data || []).map((item: { url: string }) => item.url).filter(Boolean);
    }
  } catch {}
  return [];
}

export async function generatePoseImages(
  prompt: string,
  count: number = 4,
  personPhoto?: string,
  clothingPhotos?: string[]
): Promise<string[]> {
  return generateMultiple(prompt, personPhoto, clothingPhotos, count);
}
