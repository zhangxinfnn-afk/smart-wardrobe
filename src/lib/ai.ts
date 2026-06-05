import type { ClothingItem, WeatherData, Style } from '@/types';
import { STYLES } from '@/types';

function getStyleLabel(value: string): string {
  return STYLES.find((s) => s.value === value)?.label || value;
}

/**
 * Build a prompt for Claude to recommend outfits from available clothes.
 */
export function buildOutfitPrompt(
  clothes: ClothingItem[],
  weather: WeatherData,
  style: Style,
  personName: string
): string {
  const styleLabel = getStyleLabel(style);

  const clothingList = clothes
    .map(
      (item, i) =>
        `${i + 1}. [${item.category}] ${item.name} - 颜色: ${item.colors?.join('/') || item.color || '未知'} - 风格: ${item.style?.join('/') || '通用'} - 季节: ${item.season?.join('/') || '四季'}`
    )
    .join('\n');

  return `你是一位专业的时尚搭配师。请根据以下条件为用户搭配一套完整的穿搭。

## 用户信息
- 姓名: ${personName}
- 当前城市天气: ${weather.description}
- 温度: ${weather.temperature}°C
- 季节: ${weather.season}
- 期望风格: ${styleLabel}

## 可用衣物
${clothingList}

## 要求
1. 从可用衣物中选择一套完整搭配（必须包含上装+下装或连衣裙，可选外套、鞋子、配饰）
2. 考虑天气温度和季节适合性
3. 颜色搭配要协调
4. 风格要符合"${styleLabel}"风格

请只返回 JSON 格式（不要 markdown 代码块）:
{
  "selectedItems": [{"id": "衣物ID", "reason": "选择理由"}],
  "outfitDescription": "中文穿搭描述，详细描述每一件单品及整体效果",
  "sdPrompt": "英文Stable Diffusion prompt，描述一个亚洲模特穿着这身穿搭，full body shot, fashion photography, ${styleLabel} style, ${weather.description} weather, high quality, fashion magazine"
}`;
}

/**
 * Build a prompt for generating pose photos at landmarks.
 */
export function buildPosePrompt(
  outfitDescription: string,
  landmarkName: string,
  landmarkDesc: string,
  poseStyle: string
): string {
  const poseLabels: Record<string, string> = {
    NATURAL: 'natural relaxed pose, candid travel snapshot style',
    FASHION: 'fashion editorial pose, confident model stance, Vogue magazine style',
    ARTISTIC: 'artistic poetic pose, soft dreamy aesthetic, film camera style',
    COOL: 'cool edgy pose, street style attitude, hip urban fashion',
    ELEGANT_POSE: 'elegant graceful pose, refined sophisticated, luxury lifestyle style',
    DYNAMIC: 'dynamic action pose, energetic movement, sports lifestyle photography',
  };

  const poseDesc = poseLabels[poseStyle] || poseLabels.NATURAL;

  return `A stylish person wearing ${outfitDescription}, posing at ${landmarkName}, ${landmarkDesc} in the background, ${poseDesc}, full body shot, travel photography, professional lighting, 8k, high quality`;
}

/**
 * Parse Claude's JSON response, handling possible markdown wrapping.
 */
export function parseAIResponse(text: string): Record<string, unknown> | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    // Try to find JSON object in text
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
