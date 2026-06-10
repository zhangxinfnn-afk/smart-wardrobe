/**
 * AI 图片生成 — OpenAI DALL-E 3
 */

export async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[DALL-E] API error:', JSON.stringify(err));
      return null;
    }

    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('[DALL-E] Error:', error);
    return null;
  }
}

export async function generatePoseImages(prompt: string, count: number = 4): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${prompt} (variation ${i + 1})`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
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
