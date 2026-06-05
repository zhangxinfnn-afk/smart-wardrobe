// === Enums ===
export const CATEGORIES = [
  { value: 'TOP', label: '上装', icon: 'Shirt' },
  { value: 'BOTTOM', label: '下装', icon: 'Footprints' },
  { value: 'DRESS', label: '连衣裙', icon: 'Dress' },
  { value: 'OUTERWEAR', label: '外套', icon: 'Jacket' },
  { value: 'SHOES', label: '鞋子', icon: 'Shoe' },
  { value: 'BAG', label: '包袋', icon: 'Backpack' },
  { value: 'SCARF', label: '丝巾/围巾', icon: 'Scarf' },
  { value: 'BELT', label: '腰带', icon: 'Circle' },
  { value: 'HAT', label: '帽子', icon: 'Hat' },
  { value: 'JEWELRY', label: '首饰', icon: 'Gem' },
  { value: 'GLASSES', label: '眼镜', icon: 'Glasses' },
  { value: 'OTHER', label: '其他', icon: 'Ellipsis' },
] as const;

// 衣物适用的粗略季节（用于衣帽间标签筛选）
export const SEASONS = [
  { value: 'SPRING', label: '春季', icon: 'Flower2' },
  { value: 'SUMMER', label: '夏季', icon: 'Sun' },
  { value: 'AUTUMN', label: '秋季', icon: 'Leaf' },
  { value: 'WINTER', label: '冬季', icon: 'Snowflake' },
] as const;

// 细化季节（用于天气显示和 AI 搭配，基于日期精确判断）
export const DETAILED_SEASONS = [
  { value: 'EARLY_SPRING',  label: '早春', emoji: '🌱', parent: 'SPRING' },
  { value: 'MID_SPRING',    label: '仲春', emoji: '🌸', parent: 'SPRING' },
  { value: 'LATE_SPRING',   label: '晚春', emoji: '🌿', parent: 'SPRING' },
  { value: 'EARLY_SUMMER',  label: '初夏', emoji: '🌤️', parent: 'SUMMER' },
  { value: 'MID_SUMMER',    label: '盛夏', emoji: '☀️', parent: 'SUMMER' },
  { value: 'LATE_SUMMER',   label: '晚夏', emoji: '🌻', parent: 'SUMMER' },
  { value: 'EARLY_AUTUMN',  label: '初秋', emoji: '🍂', parent: 'AUTUMN' },
  { value: 'MID_AUTUMN',    label: '仲秋', emoji: '🍁', parent: 'AUTUMN' },
  { value: 'LATE_AUTUMN',   label: '深秋', emoji: '🌾', parent: 'AUTUMN' },
  { value: 'EARLY_WINTER',  label: '初冬', emoji: '❄️', parent: 'WINTER' },
  { value: 'MID_WINTER',    label: '隆冬', emoji: '⛄', parent: 'WINTER' },
  { value: 'LATE_WINTER',   label: '晚冬', emoji: '🌬️', parent: 'WINTER' },
] as const;

export type DetailedSeason = typeof DETAILED_SEASONS[number]['value'];

// 细化季节 → 粗略季节映射（用于筛选衣物）
export function detailedToMainSeason(ds: DetailedSeason): Season {
  const found = DETAILED_SEASONS.find((s) => s.value === ds);
  return (found?.parent as Season) || 'SPRING';
}

export const STYLES = [
  { value: 'CASUAL', label: '休闲', desc: '日常舒适穿搭' },
  { value: 'FORMAL', label: '正式', desc: '商务正装场合' },
  { value: 'SPORTY', label: '运动', desc: '活力运动风格' },
  { value: 'ELEGANT', label: '优雅', desc: '精致优雅气质' },
  { value: 'STREET', label: '街头', desc: '潮流街头风格' },
  { value: 'MINIMALIST', label: '极简', desc: '简约纯粹美学' },
  { value: 'VINTAGE', label: '复古', desc: '经典怀旧韵味' },
  { value: 'ROMANTIC', label: '甜美', desc: '温柔浪漫风格' },
  { value: 'BOHEMIAN', label: '波西米亚', desc: '自由奔放艺术' },
  { value: 'BUSINESS', label: '商务', desc: '干练职场穿搭' },
] as const;

export const POSE_STYLES = [
  { value: 'NATURAL', label: '自然随性', desc: '轻松自然的日常姿态' },
  { value: 'FASHION', label: '时尚大片', desc: '杂志封面般的时尚感' },
  { value: 'ARTISTIC', label: '文艺清新', desc: '文艺范儿的优雅姿态' },
  { value: 'COOL', label: '酷帅有型', desc: '个性张扬的酷感姿势' },
  { value: 'ELEGANT_POSE', label: '优雅气质', desc: '端庄大方的优雅姿态' },
  { value: 'DYNAMIC', label: '动感活力', desc: '充满活力的动态抓拍' },
] as const;

// === Types ===
export type Category = typeof CATEGORIES[number]['value'];
export type Season = typeof SEASONS[number]['value'];
export type Style = typeof STYLES[number]['value'];
export type PoseStyle = typeof POSE_STYLES[number]['value'];

export const BODY_TYPES = [
  { value: 'SLIM', label: '纤瘦' },
  { value: 'FIT', label: '健美' },
  { value: 'AVERAGE', label: '标准' },
  { value: 'PLUMP', label: '丰满' },
  { value: 'MUSCULAR', label: '肌肉型' },
  { value: 'PETITE', label: '娇小' },
  { value: 'TALL', label: '高挑' },
] as const;

export type BodyType = typeof BODY_TYPES[number]['value'];

export const GENDERS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
] as const;

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  gender: string | null;
  frontPhoto: string | null;
  sidePhoto: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyType: BodyType | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItem {
  id: string;
  userId: string;
  user?: User;
  category: Category;
  subcategory: string | null;
  name: string;
  color: string | null;
  colors: string[];
  material: string | null;
  season: Season[];
  style: Style[];
  brand: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  isFavorite: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingFormData {
  userId: string;
  category: Category;
  subcategory?: string;
  name: string;
  color?: string;
  colors?: string[];
  material?: string;
  season: Season[];
  style: Style[];
  brand?: string;
  isFavorite?: boolean;
  notes?: string;
}

export interface Outfit {
  id: string;
  userId: string;
  user?: User;
  name: string | null;
  itemIds: string[];
  style: string;
  season: string;
  weatherType: string | null;
  cityName: string | null;
  temperature: number | null;
  prompt: string | null;
  outfitDesc: string | null;
  generatedImage: string | null;
  poseImages: OutfitPoseImage[];
  createdAt: string;
}

export interface OutfitPoseImage {
  pose: string;
  landmark: string;
  imageUrl: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  landmarks: Landmark[];
}

export interface Landmark {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface DailyForecast {
  date: string;           // YYYY-MM-DD
  dayLabel: string;       // "6月5日 周四"
  tempHigh: number;
  tempLow: number;
  weatherCode: number;    // WMO code
  description: string;    // 中文描述
  icon: string;           // emoji
  humidity: number;
  windDirection: string;
  windLevel: string;
  uvIndex: number;
  uvLevel: string;
  sunrise: string;
  sunset: string;
  precipitationProb: number; // 降水概率 %
}

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  tempHigh: number;
  tempLow: number;
  description: string;
  icon: string;
  humidity: number;
  windDirection: string;
  windLevel: string;
  uvIndex: number;
  uvLevel: string;
  sunrise: string;
  sunset: string;
  airQuality: number;
  airLevel: string;
  pressure: number;
  visibility: number;
  season: Season;
  detailedSeason: DetailedSeason;
  date: string;
  hourlyForecast: Array<{ time: string; temp: number; icon: string; desc: string }>;
  dailyForecast: DailyForecast[];  // 未来14天每日预报
}

export interface GenerateOutfitRequest {
  userId: string;
  cityName: string;
  style: Style;
  weather: WeatherData;
}

export interface GenerateOutfitResponse {
  selectedItems: { id: string; reason: string }[];
  outfitDescription: string;
  sdPrompt: string;
  generatedImageUrl: string;
}

export interface GeneratePoseRequest {
  outfitDescription: string;
  cityName: string;
  landmark: Landmark;
  poseStyle: PoseStyle;
}

export interface GeneratePoseResponse {
  images: { pose: string; imageUrl: string }[];
}
