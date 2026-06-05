import type { WeatherData, Season, DetailedSeason, DailyForecast } from '@/types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather codes → 中文描述 + emoji
const WMO_MAP: Record<number, { desc: string; icon: string }> = {
  0:  { desc: '晴',       icon: '☀️' },
  1:  { desc: '大部晴',   icon: '🌤️' },
  2:  { desc: '多云',     icon: '⛅' },
  3:  { desc: '阴',       icon: '☁️' },
  45: { desc: '雾',       icon: '🌫️' },
  48: { desc: '霜雾',     icon: '🌫️' },
  51: { desc: '小毛毛雨', icon: '🌦️' },
  53: { desc: '毛毛雨',   icon: '🌦️' },
  55: { desc: '大毛毛雨', icon: '🌧️' },
  61: { desc: '小雨',     icon: '🌧️' },
  63: { desc: '中雨',     icon: '🌧️' },
  65: { desc: '大雨',     icon: '🌧️' },
  71: { desc: '小雪',     icon: '🌨️' },
  73: { desc: '中雪',     icon: '🌨️' },
  75: { desc: '大雪',     icon: '❄️' },
  77: { desc: '雪粒',     icon: '🌨️' },
  80: { desc: '阵雨',     icon: '🌦️' },
  81: { desc: '中阵雨',   icon: '🌧️' },
  82: { desc: '大阵雨',   icon: '⛈️' },
  85: { desc: '小阵雪',   icon: '🌨️' },
  86: { desc: '大阵雪',   icon: '❄️' },
  95: { desc: '雷暴',     icon: '⛈️' },
  96: { desc: '冰雹雷暴', icon: '⛈️' },
  99: { desc: '强雷暴',   icon: '⛈️' },
};

function wmoDesc(code: number): string {
  return WMO_MAP[code]?.desc || '未知';
}

function wmoIcon(code: number): string {
  return WMO_MAP[code]?.icon || '🌈';
}

// WMO → OpenWeatherMap icon code (for compatibility with existing img src)
function wmoToOwmIcon(code: number): string {
  if (code === 0) return '01d';
  if (code <= 3) return '02d';
  if (code === 45 || code === 48) return '50d';
  if (code <= 55) return '09d';
  if (code <= 65) return '10d';
  if (code <= 77) return '13d';
  if (code <= 82) return '10d';
  if (code <= 86) return '13d';
  return '11d';
}

function degToDir(deg: number): string {
  const dirs = ['北风','东北风','东风','东南风','南风','西南风','西风','西北风'];
  return dirs[Math.round(deg / 45) % 8];
}

function msToLevel(ms: number): string {
  if (ms < 0.3) return '0级'; if (ms < 1.6) return '1级';
  if (ms < 3.4) return '2级'; if (ms < 5.5) return '3级';
  if (ms < 8.0) return '4级'; if (ms < 10.8) return '5级';
  if (ms < 13.9) return '6级'; return '7级+';
}

function uvToLevel(uv: number): string {
  if (uv <= 2) return '较弱'; if (uv <= 5) return '中等';
  if (uv <= 7) return '强'; if (uv <= 10) return '很强';
  return '极强';
}

// 根据日期和纬度判断细化季节
function getDetailedSeason(date: Date, lat: number): DetailedSeason {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;
  if (lat >= 0) {
    if (md >= 215 && md < 315)  return 'EARLY_SPRING';
    if (md >= 315 && md < 415)  return 'MID_SPRING';
    if (md >= 415 && md < 515)  return 'LATE_SPRING';
    if (md >= 515 && md < 615)  return 'EARLY_SUMMER';
    if (md >= 615 && md < 815)  return 'MID_SUMMER';
    if (md >= 815 && md < 915)  return 'LATE_SUMMER';
    if (md >= 915 && md < 1015) return 'EARLY_AUTUMN';
    if (md >= 1015 && md < 1115) return 'MID_AUTUMN';
    if (md >= 1115 && md < 1215) return 'LATE_AUTUMN';
    if (md >= 1215 || md < 115)  return 'EARLY_WINTER';
    if (md >= 115 && md < 215)   return 'MID_WINTER';
  }
  if (lat < 0) {
    if (md >= 215 && md < 315)  return 'EARLY_AUTUMN';
    if (md >= 315 && md < 415)  return 'MID_AUTUMN';
    if (md >= 415 && md < 515)  return 'LATE_AUTUMN';
    if (md >= 515 && md < 615)  return 'EARLY_WINTER';
    if (md >= 615 && md < 815)  return 'MID_WINTER';
    if (md >= 815 && md < 915)  return 'LATE_WINTER';
    if (md >= 915 && md < 1015) return 'EARLY_SPRING';
    if (md >= 1015 && md < 1115) return 'MID_SPRING';
    if (md >= 1115 && md < 1215) return 'LATE_SPRING';
    if (md >= 1215 || md < 115)  return 'EARLY_SUMMER';
    if (md >= 115 && md < 215)   return 'MID_SUMMER';
  }
  return 'MID_SUMMER';
}

function detailedToMain(ds: DetailedSeason): Season {
  const map: Record<DetailedSeason, Season> = {
    EARLY_SPRING: 'SPRING', MID_SPRING: 'SPRING', LATE_SPRING: 'SPRING',
    EARLY_SUMMER: 'SUMMER', MID_SUMMER: 'SUMMER', LATE_SUMMER: 'SUMMER',
    EARLY_AUTUMN: 'AUTUMN', MID_AUTUMN: 'AUTUMN', LATE_AUTUMN: 'AUTUMN',
    EARLY_WINTER: 'WINTER', MID_WINTER: 'WINTER', LATE_WINTER: 'WINTER',
  };
  return map[ds];
}

const weekDays = ['周日','周一','周二','周三','周四','周五','周六'];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
}

/**
 * 调用 Open-Meteo 免费 API 获取实时天气 + 14 天预报
 */
export async function getWeather(
  cityName: string,
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'surface_pressure',
      ].join(','),
      hourly: [
        'temperature_2m',
        'weather_code',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
        'uv_index_max',
        'sunrise',
        'sunset',
      ].join(','),
      forecast_days: '14',
      timezone: 'Asia/Shanghai',
      forecast_hours: '48',
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

    const data = await res.json();

    // ====== 当前天气 ======
    const current = data.current;
    const now = new Date();
    const ds = getDetailedSeason(now, lat);
    const wCode = current.weather_code;
    const windSpeed = current.wind_speed_10m;
    const windDeg = current.wind_direction_10m;

    // ====== 逐半小时预报 00:00-23:30（从 hourly 数据线性插值生成 48 个点） ======
    const hourly = data.hourly;
    const halfHourForecast = Array.from({ length: 48 }, (_, i) => {
      const halfHourIndex = i; // 0..47 对应 00:00, 00:30, ..., 23:30
      const hourIndex = Math.floor(halfHourIndex / 2); // 对应的小时
      const isHalf = halfHourIndex % 2 === 1; // 是否为 :30

      const h = Math.floor(halfHourIndex / 2);
      const m = halfHourIndex % 2 === 0 ? '00' : '30';

      // 当前小时和下一小时的数据做线性插值
      const currTemp = hourly.temperature_2m?.[hourIndex] ?? hourly.temperature_2m?.[0] ?? 20;
      const nextTemp = hourly.temperature_2m?.[hourIndex + 1] ?? currTemp;
      const temp = isHalf ? Math.round((currTemp + nextTemp) / 2) : Math.round(currTemp);

      const currCode = hourly.weather_code?.[hourIndex] ?? 0;
      const icon = wmoToOwmIcon(currCode);
      const desc = wmoDesc(currCode);

      return {
        time: `${String(h).padStart(2, '0')}:${m}`,
        temp,
        icon,
        desc,
      };
    });

    // ====== 14 天每日预报 ======
    const daily = data.daily;
    const dailyForecast: DailyForecast[] = daily.time.map((date: string, i: number) => ({
      date,
      dayLabel: formatDateLabel(date),
      tempHigh: Math.round(daily.temperature_2m_max[i]),
      tempLow: Math.round(daily.temperature_2m_min[i]),
      weatherCode: daily.weather_code[i],
      description: wmoDesc(daily.weather_code[i]),
      icon: wmoIcon(daily.weather_code[i]),
      humidity: current.relative_humidity_2m,
      windDirection: degToDir(daily.wind_direction_10m_dominant?.[i] || windDeg),
      windLevel: msToLevel(daily.wind_speed_10m_max?.[i] || windSpeed),
      uvIndex: Math.round(daily.uv_index_max?.[i] || 0),
      uvLevel: uvToLevel(daily.uv_index_max?.[i] || 0),
      sunrise: daily.sunrise[i].slice(11, 16),
      sunset: daily.sunset[i].slice(11, 16),
      precipitationProb: daily.precipitation_probability_max?.[i] || 0,
    }));

    // 今天的数据来自 daily[0]
    const today = dailyForecast[0];

    return {
      city: cityName,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      tempHigh: today.tempHigh,
      tempLow: today.tempLow,
      description: wmoDesc(wCode),
      icon: wmoToOwmIcon(wCode),
      humidity: current.relative_humidity_2m,
      windDirection: degToDir(windDeg),
      windLevel: msToLevel(windSpeed),
      uvIndex: today.uvIndex,
      uvLevel: today.uvLevel,
      sunrise: today.sunrise,
      sunset: today.sunset,
      airQuality: 0,
      airLevel: '--',
      pressure: Math.round(current.surface_pressure),
      visibility: 10,
      season: detailedToMain(ds),
      detailedSeason: ds,
      date: now.toISOString(),
      hourlyForecast: halfHourForecast,
      dailyForecast,
    };
  } catch (error) {
    console.error('Open-Meteo API error, falling back to mock:', error);
    return getMockWeather(cityName, lat);
  }
}

// ====== Mock 降级数据（API 不可用时使用） ======

interface MockCityWeather {
  temp: number; tempHigh: number; tempLow: number; desc: string; icon: string;
  windDeg: number; windSpeed: number; humidity: number;
  uvIndex: number; sunrise: string; sunset: string;
  pressure: number; visibility: number;
}

const MOCK_DATA: Record<string, MockCityWeather> = {
  '北京': { temp: 30, tempHigh: 34, tempLow: 22, desc: '晴', icon: '01d', windDeg: 180, windSpeed: 3, humidity: 42, uvIndex: 8, sunrise: '04:47', sunset: '19:40', pressure: 1006, visibility: 12.5 },
  '上海': { temp: 28, tempHigh: 31, tempLow: 24, desc: '多云', icon: '02d', windDeg: 135, windSpeed: 4, humidity: 68, uvIndex: 6, sunrise: '04:52', sunset: '18:55', pressure: 1008, visibility: 10.2 },
  '广州': { temp: 32, tempHigh: 35, tempLow: 27, desc: '阵雨', icon: '10d', windDeg: 180, windSpeed: 5, humidity: 78, uvIndex: 5, sunrise: '05:42', sunset: '19:10', pressure: 1004, visibility: 8.6 },
  '成都': { temp: 26, tempHigh: 29, tempLow: 22, desc: '阴', icon: '04d', windDeg: 45, windSpeed: 2, humidity: 72, uvIndex: 4, sunrise: '06:04', sunset: '20:05', pressure: 1010, visibility: 9.3 },
  '杭州': { temp: 25, tempHigh: 31, tempLow: 20, desc: '多云', icon: '02d', windDeg: 135, windSpeed: 3, humidity: 63, uvIndex: 6, sunrise: '04:37', sunset: '19:12', pressure: 1004, visibility: 7.8 },
  '深圳': { temp: 31, tempHigh: 33, tempLow: 26, desc: '雷阵雨', icon: '11d', windDeg: 225, windSpeed: 6, humidity: 82, uvIndex: 7, sunrise: '05:40', sunset: '19:08', pressure: 1003, visibility: 9.1 },
  '东京': { temp: 25, tempHigh: 28, tempLow: 21, desc: '晴', icon: '01d', windDeg: 180, windSpeed: 4, humidity: 55, uvIndex: 7, sunrise: '04:27', sunset: '18:56', pressure: 1012, visibility: 15.0 },
  '巴黎': { temp: 20, tempHigh: 24, tempLow: 14, desc: '多云', icon: '03d', windDeg: 270, windSpeed: 6, humidity: 58, uvIndex: 5, sunrise: '05:52', sunset: '21:52', pressure: 1018, visibility: 14.2 },
  '纽约': { temp: 22, tempHigh: 26, tempLow: 17, desc: '晴', icon: '01d', windDeg: 315, windSpeed: 5, humidity: 45, uvIndex: 8, sunrise: '05:25', sunset: '20:25', pressure: 1015, visibility: 16.0 },
};

function getMockWeather(cityName: string, lat: number): WeatherData {
  const now = new Date();
  const data = MOCK_DATA[cityName] || {
    temp: 25, tempHigh: 30, tempLow: 20, desc: '晴', icon: '01d',
    windDeg: 90, windSpeed: 3, humidity: 55, uvIndex: 5,
    sunrise: '05:00', sunset: '19:00', pressure: 1010, visibility: 10,
  };
  const ds = getDetailedSeason(now, lat);

  // 生成 14 天 mock 预报
  const dailyForecast: DailyForecast[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
    const variation = Math.round((Math.random() - 0.5) * 6);
    return {
      date: dateStr,
      dayLabel,
      tempHigh: data.tempHigh + variation,
      tempLow: data.tempLow + variation - 2,
      weatherCode: 1,
      description: data.desc,
      icon: '⛅',
      humidity: data.humidity + Math.round((Math.random() - 0.5) * 10),
      windDirection: degToDir(data.windDeg),
      windLevel: msToLevel(data.windSpeed),
      uvIndex: data.uvIndex,
      uvLevel: uvToLevel(data.uvIndex),
      sunrise: data.sunrise,
      sunset: data.sunset,
      precipitationProb: Math.floor(Math.random() * 30),
    };
  });

  // 逐半小时 mock 预报 00:00-23:30
  const halfHourForecast = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    // 温度正弦曲线
    const progress = i / 47;
    const temp = Math.round(data.tempLow + (data.tempHigh - data.tempLow) * Math.sin(progress * Math.PI));
    return {
      time: `${String(h).padStart(2, '0')}:${m}`,
      temp,
      icon: data.icon,
      desc: data.desc,
    };
  });

  return {
    city: cityName,
    temperature: data.temp,
    feelsLike: data.temp - 1,
    tempHigh: data.tempHigh,
    tempLow: data.tempLow,
    description: data.desc,
    icon: data.icon,
    humidity: data.humidity,
    windDirection: degToDir(data.windDeg),
    windLevel: msToLevel(data.windSpeed),
    uvIndex: data.uvIndex,
    uvLevel: uvToLevel(data.uvIndex),
    sunrise: data.sunrise,
    sunset: data.sunset,
    airQuality: 0,
    airLevel: '--',
    pressure: data.pressure,
    visibility: data.visibility,
    season: detailedToMain(ds),
    detailedSeason: ds,
    date: now.toISOString(),
    hourlyForecast: halfHourForecast,
    dailyForecast,
  };
}
