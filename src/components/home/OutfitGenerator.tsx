'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Spinner } from '@/components/ui/Spinner';
import type { Outfit, GenerateOutfitResponse } from '@/types';
import { STYLES } from '@/types';
import { cn } from '@/lib/utils';

interface OutfitGeneratorProps {
  onOutfitGenerated: (outfit: GenerateOutfitResponse) => void;
  currentOutfit: GenerateOutfitResponse | null;
}

export function OutfitGenerator({
  onOutfitGenerated,
  currentOutfit,
}: OutfitGeneratorProps) {
  const { currentUser, currentCity, currentStyle, weather } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const styleLabel = STYLES.find((s) => s.value === currentStyle)?.label || currentStyle;

  const handleGenerate = async () => {
    if (!currentUser) {
      setError('请先选择穿搭对象');
      return;
    }
    if (!weather) {
      setError('天气数据加载中，请稍后');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/generate/outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cityName: currentCity.name,
          style: currentStyle,
          weather,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '生成失败');
      }

      const data: GenerateOutfitResponse = await res.json();
      onOutfitGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating || !currentUser || !weather}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-all',
            generating
              ? 'bg-purple-400 cursor-wait'
              : 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-xl'
          )}
        >
          {generating ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              AI 搭配中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              智能搭配
            </>
          )}
        </button>

        {currentOutfit && !generating && (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            换一套
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {currentOutfit && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Generated image */}
          <OutfitImage imageUrl={currentOutfit.generatedImageUrl} outfit={currentOutfit} styleLabel={styleLabel} />

          {/* Outfit description */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✨ {styleLabel}风格 · {weather?.city || currentCity.name} 穿搭
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentOutfit.outfitDescription}
            </p>

            {/* Selected items */}
            {currentOutfit.selectedItems && currentOutfit.selectedItems.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentOutfit.selectedItems.map((si, i) => (
                  <span
                    key={i}
                    className="inline-block px-2.5 py-1 text-xs rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                  >
                    {si.reason}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState as useStateImg } from 'react';

/** 穿搭效果图：加载 AI 图片，带 loading 和重试 */
function OutfitImage({
  imageUrl,
  outfit,
  styleLabel,
}: {
  imageUrl: string | null;
  outfit: GenerateOutfitResponse;
  styleLabel: string;
}) {
  const [imgError, setImgError] = useStateImg(false);
  const [imgLoaded, setImgLoaded] = useStateImg(false);
  const [retryKey, setRetryKey] = useStateImg(0);

  if (imageUrl && !imgError) {
    return (
      <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-700">
        {!imgLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin mb-2" />
            <span className="text-xs text-gray-400">AI 正在生成效果图...</span>
          </div>
        )}
        <img
          key={retryKey}
          src={imageUrl}
          alt="AI 穿搭效果图"
          className="w-full h-full object-cover"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
        {imgLoaded && (
          <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/60 bg-black/30 rounded-lg px-2 py-1">
            由 AI 生成 · 仅供参考
          </div>
        )}
      </div>
    );
  }

  // 加载失败 → 占位穿搭卡片
  const colors = [
    'from-purple-500 via-pink-500 to-amber-500',
    'from-blue-500 via-purple-500 to-rose-500',
    'from-emerald-500 via-teal-500 to-blue-500',
    'from-amber-500 via-orange-500 to-red-500',
  ];
  const bg = colors[Math.floor(styleLabel.length % colors.length)];

  return (
    <div className={`aspect-[3/4] relative bg-gradient-to-br ${bg} flex flex-col items-center justify-center p-8 text-white overflow-hidden`}>
      {/* 装饰圆 */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute bottom-20 left-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white/20" />

      {/* 内容 */}
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-xl font-bold mb-2">{styleLabel}风格</h3>
        <p className="text-sm text-white/80 leading-relaxed max-w-[240px] line-clamp-4">
          {outfit.outfitDescription}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/60" />
          <div className="w-16 h-0.5 bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/60" />
        </div>
        {imageUrl && (
          <button
            onClick={() => { setImgError(false); setRetryKey(k => k + 1); }}
            className="mt-3 px-4 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            重新加载图片
          </button>
        )}
      </div>
    </div>
  );
}
