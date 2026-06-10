/**
 * AI 图片生成 — 使用免费 Pollinations.ai API（无需 Key）
 * 浏览器直接加载图片，绕过服务器 IP 限流
 */

const BASE = 'https://image.pollinations.ai/prompt';

export async function generateImage(prompt: string): Promise<string> {
  // 限制 prompt 长度避免 URL 过长
  const short = prompt.slice(0, 800);
  const encoded = encodeURIComponent(short);
  // 不加 model 参数，使用默认免费模型
  const url = `${BASE}/${encoded}?width=768&height=1024&nologo=true&seed=${Date.now()}`;
  return url;
}

export async function generatePoseImages(
  prompt: string,
  count: number = 4
): Promise<string[]> {
  const short = prompt.slice(0, 800);
  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    const encoded = encodeURIComponent(`${short} --seed ${Date.now() + i}`);
    urls.push(`${BASE}/${encoded}?width=768&height=1024&nologo=true`);
  }
  return urls;
}
