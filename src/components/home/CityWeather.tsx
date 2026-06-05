'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  MapPin, ChevronDown, Calendar, Droplets, Wind, Eye, Gauge,
  Sunrise, Sunset, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CITIES } from '@/lib/cities';
import { useAppStore } from '@/stores/useAppStore';
import { DETAILED_SEASONS } from '@/types';
import type { WeatherData, DailyForecast } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

export function CityWeather() {
  const { currentCity, setCurrentCity, weather, setWeather } = useAppStore();
  const [showCityList, setShowCityList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  const dateStr = useMemo(() => {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const w = weekDays[now.getDay()];
    return `${m}月${d}日 ${w}`;
  }, []);

  const seasonInfo = weather?.detailedSeason
    ? DETAILED_SEASONS.find((s) => s.value === weather.detailedSeason)
    : null;

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
          setSelectedDay(null); // 重置为今天
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWeather();
    return () => { cancelled = true; };
  }, [currentCity, setWeather]);

  // 当前展示的天（selectedDay 或今天 = dailyForecast[0]）
  const displayDay = selectedDay || weather?.dailyForecast?.[0] || null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Spinner size="sm" />
        <span className="text-xs text-gray-400">天气加载中...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div>
      {/* ====== 第一行：城市 + 日期 + 季节 ====== */}
      <div className="flex items-center gap-4 flex-wrap mb-3">
        <div className="relative">
          <button
            onClick={() => setShowCityList(!showCityList)}
            className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-white hover:text-purple-600 transition-colors"
          >
            <MapPin className="w-4 h-4 text-purple-500" />
            {currentCity.name}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showCityList && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCityList(false)} />
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-56 overflow-y-auto">
                {CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => { setCurrentCity(city); setShowCityList(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between"
                  >
                    <span>{city.name} <span className="text-gray-400 text-xs">{city.country}</span></span>
                    {currentCity.id === city.id && <span className="text-purple-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <span className="text-sm text-gray-500">
          <Calendar className="w-3.5 h-3.5 inline mr-1" />
          {displayDay?.dayLabel || dateStr}
        </span>

        {seasonInfo && !selectedDay && (
          <span className="text-sm text-gray-500">{seasonInfo.emoji} {seasonInfo.label}</span>
        )}

        {selectedDay && (
          <button
            onClick={() => setSelectedDay(null)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            回到今天
          </button>
        )}
      </div>

      {/* ====== 第二行：温度 + 天气概况 ====== */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl font-light text-gray-900 dark:text-white tracking-tight">
          {selectedDay ? displayDay?.tempHigh : weather.temperature}°
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">{displayDay?.icon || '🌈'}</span>
            <span className="text-base text-gray-700 dark:text-gray-300">
              {displayDay?.description || weather.description}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            温度 {displayDay?.tempHigh || weather.tempHigh}° / {displayDay?.tempLow || weather.tempLow}°
            {!selectedDay && <>  体感 {weather.feelsLike}°</>}
          </div>
        </div>
      </div>

      {/* ====== 第三行：详细信息 3x2 ====== */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Wind className="w-4 h-4 text-cyan-500 flex-shrink-0" />
          <span>{displayDay?.windDirection || weather.windDirection} {displayDay?.windLevel || weather.windLevel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>湿度 {displayDay?.humidity ?? weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Sunrise className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>紫外线 {displayDay?.uvIndex ?? weather.uvIndex} {displayDay?.uvLevel || weather.uvLevel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Sunset className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>日出 {displayDay?.sunrise || weather.sunrise} 日落 {displayDay?.sunset || weather.sunset}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>降水概率 {displayDay?.precipitationProb ?? 0}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Gauge className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>气压 {weather.pressure}hpa</span>
          <Eye className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1" />
          <span>{weather.visibility}km</span>
        </div>
      </div>

      {/* ====== 14 天预报日期条 ====== */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">未来 14 天</span>
          {selectedDay && (
            <span className="text-xs text-purple-600 font-medium">{selectedDay.dayLabel}</span>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {weather.dailyForecast.map((day, i) => {
            const isSelected = selectedDay?.date === day.date;
            const isToday = !selectedDay && i === 0;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all min-w-[64px] border
                  ${isSelected || isToday
                    ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700'
                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
              >
                <span className="text-[11px] text-gray-400 leading-tight">
                  {i === 0 ? '今天' : day.dayLabel.slice(0, -3)}
                </span>
                <span className="text-lg">{day.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {day.tempHigh}°
                </span>
                <span className="text-[11px] text-gray-400">
                  {day.tempLow}°
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====== 逐半小时预报 ====== */}
      <HalfHourlyForecast
        forecast={weather.hourlyForecast}
        day={displayDay}
        isToday={!selectedDay}
      />
    </div>
  );
}

/** 根据当天预报生成或展示逐半小时数据 */
function HalfHourlyForecast({
  forecast,
  day,
  isToday,
}: {
  forecast: WeatherData['hourlyForecast'];
  day: DailyForecast | null;
  isToday: boolean;
}) {
  // 今天用真实 forecast，其他天根据 day 数据生成模拟
  const items = isToday && forecast.length > 0
    ? forecast
    : generateDayForecast(day);

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-400 mb-2">
        逐半小时预报{!isToday && day ? ` · ${day.dayLabel}` : ''}（00:00 — 23:30）
      </div>
      <div className="flex gap-[2px] overflow-x-auto pb-2">
        {items.map((f, i) => {
          const isHour = i % 2 === 0; // :00 整点
          const isLabel = i % 6 === 0; // 每 3 小时显示时间标签
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-[2px] px-1 py-1.5 rounded flex-shrink-0 min-w-[36px]
                ${isHour ? 'bg-gray-100 dark:bg-gray-800/70' : 'bg-gray-50 dark:bg-gray-800/30'}`}
            >
              <span className={`${isLabel ? 'text-[9px] text-gray-500' : 'text-[9px] text-gray-300'} leading-none`}>
                {isLabel ? f.time : '·'}
              </span>
              <img
                src={`https://openweathermap.org/img/wn/${f.icon}.png`}
                alt=""
                className="w-4 h-4"
              />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 leading-none">{f.temp}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 根据某天的最高/最低温生成 48 个逐半小时预报（00:00-23:30） */
function generateDayForecast(day: DailyForecast | null): Array<{ time: string; temp: number; icon: string; desc: string }> {
  if (!day) return [];
  const totalSlots = 48;
  return Array.from({ length: totalSlots }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    // 温度正弦曲线：最低在凌晨 ~4:00，最高在下午 ~14:00
    const progress = i / (totalSlots - 1);
    const temp = Math.round(day.tempLow + (day.tempHigh - day.tempLow) * Math.sin(progress * Math.PI));
    const iconCode = day.weatherCode || 2;
    return {
      time: `${String(h).padStart(2, '0')}:${m}`,
      temp,
      icon: ['01d','02d','03d','04d','09d','10d','11d','13d','50d'][iconCode % 9],
      desc: day.description,
    };
  });
}
