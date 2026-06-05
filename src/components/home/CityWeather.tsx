'use client';

import { useState, useEffect } from 'react';
import { MapPin, Thermometer, Droplets, Wind, ChevronDown } from 'lucide-react';
import { CITIES } from '@/lib/cities';
import { useAppStore } from '@/stores/useAppStore';
import type { WeatherData, City } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

export function CityWeather() {
  const { currentCity, setCurrentCity, weather, setWeather } = useAppStore();
  const [showCityList, setShowCityList] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch weather when city changes
  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          city: currentCity.name,
          lat: String(currentCity.lat),
          lon: String(currentCity.lon),
        });
        const res = await fetch(`/api/weather?${params}`);
        if (res.ok && !cancelled) {
          const data: WeatherData = await res.json();
          setWeather(data);
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [currentCity, setWeather]);

  const seasonLabels: Record<string, { label: string; emoji: string }> = {
    SPRING: { label: '春季', emoji: '🌸' },
    SUMMER: { label: '夏季', emoji: '☀️' },
    AUTUMN: { label: '秋季', emoji: '🍂' },
    WINTER: { label: '冬季', emoji: '❄️' },
  };

  const seasonInfo = weather?.season
    ? seasonLabels[weather.season]
    : { label: '--', emoji: '' };

  return (
    <div className="relative">
      {/* City selector */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <button
            onClick={() => setShowCityList(!showCityList)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors text-sm font-medium"
          >
            <MapPin className="w-4 h-4 text-purple-500" />
            <span className="text-gray-900 dark:text-white">
              {currentCity.name}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showCityList && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCityList(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-64 overflow-y-auto">
                {CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setCurrentCity(city);
                      setShowCityList(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <span>
                      {city.name}
                      <span className="text-gray-400 ml-1 text-xs">
                        {city.country}
                      </span>
                    </span>
                    {currentCity.id === city.id && (
                      <span className="text-purple-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Season badge */}
        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 text-sm">
          {seasonInfo.emoji} {seasonInfo.label}
        </span>
      </div>

      {/* Weather card */}
      {loading ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Spinner size="sm" />
          <span className="text-sm text-gray-500">获取天气中...</span>
        </div>
      ) : weather ? (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Weather icon */}
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-16 h-16"
              />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {weather.temperature}
                  </span>
                  <span className="text-lg text-gray-400">°C</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {weather.description} · 体感 {weather.feelsLike}°C
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>{weather.windSpeed} m/s</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
