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

export const SEASONS = [
  { value: 'SPRING', label: '春季', icon: 'Flower2' },
  { value: 'SUMMER', label: '夏季', icon: 'Sun' },
  { value: 'AUTUMN', label: '秋季', icon: 'Leaf' },
  { value: 'WINTER', label: '冬季', icon: 'Snowflake' },
] as const;

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

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  gender: string | null;
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

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  season: Season;
  date: string;
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
