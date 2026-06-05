import type { WeatherData, Season } from '@/types';

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

function getSeason(date: Date, lat: number): Season {
  const month = date.getMonth() + 1;
  // Northern hemisphere
  if (lat >= 0) {
    if (month >= 3 && month <= 5) return 'SPRING';
    if (month >= 6 && month <= 8) return 'SUMMER';
    if (month >= 9 && month <= 11) return 'AUTUMN';
    return 'WINTER';
  }
  // Southern hemisphere
  if (month >= 3 && month <= 5) return 'AUTUMN';
  if (month >= 6 && month <= 8) return 'WINTER';
  if (month >= 9 && month <= 11) return 'SPRING';
  return 'SUMMER';
}

// Mock weather data for development (no API key needed)
function getMockWeather(cityName: string, lat: number): WeatherData {
  const now = new Date();
  const mockData: Record<string, { temp: number; desc: string; icon: string }> = {
    '北京': { temp: 30, desc: '晴', icon: '01d' },
    '上海': { temp: 28, desc: '多云', icon: '02d' },
    '广州': { temp: 32, desc: '阵雨', icon: '10d' },
    '成都': { temp: 26, desc: '阴', icon: '04d' },
    '杭州': { temp: 29, desc: '晴转多云', icon: '02d' },
    '深圳': { temp: 31, desc: '雷阵雨', icon: '11d' },
    '东京': { temp: 25, desc: '晴', icon: '01d' },
    '巴黎': { temp: 20, desc: '多云', icon: '03d' },
    '纽约': { temp: 22, desc: '晴', icon: '01d' },
  };

  const data = mockData[cityName] || { temp: 25, desc: '晴', icon: '01d' };

  return {
    city: cityName,
    temperature: data.temp,
    feelsLike: data.temp - 2,
    description: data.desc,
    icon: data.icon,
    humidity: 55 + Math.floor(Math.random() * 20),
    windSpeed: 2 + Math.floor(Math.random() * 5),
    season: getSeason(now, lat),
    date: now.toISOString(),
  };
}

export async function getWeather(
  cityName: string,
  lat: number,
  lon: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Use real API if key is available
  if (apiKey && apiKey !== 'your_openweather_key') {
    try {
      const res = await fetch(
        `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_cn`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          city: cityName,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          season: getSeason(new Date(), lat),
          date: new Date().toISOString(),
        };
      }
    } catch {
      // Fall back to mock on API error
    }
  }

  return getMockWeather(cityName, lat);
}
