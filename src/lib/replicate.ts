/**
 * AI 图片生成 — 豆包 Seedream（火山方舟）
 */

const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

export async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(ARK_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'doubao-seedream-4-5-251128',
        prompt: prompt.slice(0, 1000),
        n: 1,
        size: '1920x1920',
      }),
    });
    if (!res.ok) { console.error('[Seedream] HTTP', res.status); return null; }
    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch (e) {
    console.error('[Seedream] Error:', e);
    return null;
  }
}

export async function generatePoseImages(prompt: string, count: number = 4): Promise<string[]> {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) return [];

  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const res = await fetch(ARK_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'doubao-seedream-4-5-251128',
          prompt: `${prompt} (variation ${i + 1})`.slice(0, 1000),
          n: 1,
          size: '1920x1920',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.[0]?.url) urls.push(data.data[0].url);
      }
    } catch {}
  }
  return urls;
}
