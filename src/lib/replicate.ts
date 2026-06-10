/**
 * AI 图片生成 — 使用免费 Pollinations.ai API（无需 Key）
 * 文档: https://pollinations.ai
 */

const BASE = 'https://image.pollinations.ai/prompt';

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt);
    const url = `${BASE}/${encoded}?width=768&height=1024&model=flux&nologo=true`;
    // 验证图片可访问
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return url;
    return url; // HEAD 可能不支持，直接返回 URL
  } catch (error) {
    console.error('[Pollinations] Generation failed:', error);
    return null;
  }
}

export async function generatePoseImages(
  prompt: string,
  count: number = 4
): Promise<string[]> {
  try {
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      // 每个图片加不同 seed 生成不同姿势
      const encoded = encodeURIComponent(`${prompt} --seed ${Date.now() + i}`);
      urls.push(`${BASE}/${encoded}?width=768&height=1024&model=flux&nologo=true`);
    }
    return urls;
  } catch (error) {
    console.error('[Pollinations] Pose generation failed:', error);
    return [];
  }
}
