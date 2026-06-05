import type { ClothingItem, WeatherData, Style, User as UserType } from '@/types';
import { STYLES, BODY_TYPES, GENDERS } from '@/types';

function getStyleLabel(value: string): string {
  return STYLES.find((s) => s.value === value)?.label || value;
}

function getBodyTypeLabel(value: string): string {
  return BODY_TYPES.find((b) => b.value === value)?.label || value;
}

function getGenderLabel(value: string): string {
  return GENDERS.find((g) => g.value === value)?.label || value;
}

/**
 * 根据用户资料构建身体描述文本
 */
export function buildBodyDescription(user: UserType): string {
  const parts: string[] = [];

  if (user.gender) {
    const genderLabel = getGenderLabel(user.gender);
    parts.push(`性别: ${genderLabel}`);
  }
  if (user.height) {
    parts.push(`身高: ${user.height}cm`);
  }
  if (user.weight) {
    parts.push(`体重: ${user.weight}kg`);
  }
  if (user.age) {
    parts.push(`年龄: ${user.age}岁`);
  }
  if (user.bodyType) {
    const bodyLabel = getBodyTypeLabel(user.bodyType);
    parts.push(`身材: ${bodyLabel}`);
  }

  return parts.join(', ');
}

/**
 * 构建用于 Stable Diffusion 的人物外观描述
 */
export function buildAppearancePrompt(user: UserType): string {
  const parts: string[] = [];

  const genderLabel = user.gender ? getGenderLabel(user.gender) : '';
  if (genderLabel === '女') parts.push('female');
  else if (genderLabel === '男') parts.push('male');
  else parts.push('person');

  if (user.age) parts.push(`${user.age} years old`);

  const bodyTypeMap: Record<string, string> = {
    SLIM: 'slim',
    FIT: 'fit athletic',
    AVERAGE: 'average',
    PLUMP: 'plump curvy',
    MUSCULAR: 'muscular',
    PETITE: 'petite short',
    TALL: 'tall',
  };

  if (user.bodyType && bodyTypeMap[user.bodyType]) {
    parts.push(`${bodyTypeMap[user.bodyType]} body type`);
  }

  if (user.height) {
    parts.push(`${user.height}cm tall`);
  }

  return parts.join(', ');
}

/**
 * Build a prompt for Claude to recommend outfits from available clothes.
 */
export function buildOutfitPrompt(
  clothes: ClothingItem[],
  weather: WeatherData,
  style: Style,
  user: UserType
): string {
  const styleLabel = getStyleLabel(style);
  const bodyDesc = buildBodyDescription(user);

  const clothingList = clothes
    .map(
      (item, i) =>
        `${i + 1}. [${item.category}] ${item.name} - 颜色: ${item.colors?.join('/') || item.color || '未知'} - 风格: ${item.style?.join('/') || '通用'} - 季节: ${item.season?.join('/') || '四季'}`
    )
    .join('\n');

  return `你是一位专业的时尚搭配师。请根据以下条件为用户搭配一套完整的穿搭。

## 用户信息
- 姓名: ${user.name}
- ${bodyDesc}
- 当前城市天气: ${weather.description}
- 温度: ${weather.temperature}°C
- 季节: ${weather.season}
- 期望风格: ${styleLabel}

## 可用衣物
${clothingList}

## 搭配要求
1. 从可用衣物中选择一套完整搭配（必须包含上装+下装或连衣裙，可选外套、鞋子、配饰）
2. 考虑用户的身材特点，选择能扬长避短的款式
3. 考虑天气温度和季节适合性
4. 颜色搭配要协调，符合用户的年龄气质
5. 整体风格要符合"${styleLabel}"风格

请只返回 JSON 格式（不要 markdown 代码块）:
{
  "selectedItems": [{"id": "衣物ID", "reason": "选择理由"}],
  "outfitDescription": "中文穿搭描述，从用户身材特点出发，详细描述每一件单品及整体搭配效果",
  "sdPrompt": "英文Stable Diffusion prompt，描述一位符合用户身体特征的人穿着这身穿搭，包含外貌描述，full body shot, fashion photography, ${styleLabel} style, ${weather.description} weather, high quality, fashion magazine, detailed clothing texture"
}`;
}

/**
 * Build a prompt for generating pose photos at landmarks.
 */
export function buildPosePrompt(
  outfitDescription: string,
  landmarkName: string,
  landmarkDesc: string,
  poseStyle: string,
  user?: UserType | null
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

  // 构建人物外观描述
  let appearanceDesc = 'a stylish person';
  if (user) {
    const genderLabel = user.gender ? getGenderLabel(user.gender) : '';
    const genderEn = genderLabel === '女' ? 'woman' : genderLabel === '男' ? 'man' : 'person';

    const ageStr = user.age ? ` ${user.age}-year-old` : '';

    const bodyTypeMap: Record<string, string> = {
      SLIM: 'slim',
      FIT: 'fit athletic',
      AVERAGE: 'average build',
      PLUMP: 'curvy',
      MUSCULAR: 'muscular',
      PETITE: 'petite',
      TALL: 'tall',
    };
    const bodyStr = user.bodyType && bodyTypeMap[user.bodyType]
      ? ` ${bodyTypeMap[user.bodyType]}`
      : '';
    const heightStr = user.height ? ` ${user.height}cm` : '';

    appearanceDesc = `a${ageStr}${bodyStr}${heightStr} ${genderEn}`;
  }

  return `A full body shot of ${appearanceDesc} wearing ${outfitDescription}, posing at ${landmarkName}, ${landmarkDesc} in the background, ${poseDesc}, travel photography, professional lighting, 8k, high quality, detailed`;
}

/**
 * Parse Claude's JSON response, handling possible markdown wrapping.
 */
export function parseAIResponse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
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
