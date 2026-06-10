'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, User } from 'lucide-react';
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

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {currentOutfit && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <OutfitImage outfit={currentOutfit} styleLabel={styleLabel} />

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✨ {styleLabel}风格 · {weather?.city || currentCity.name} 穿搭
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentOutfit.outfitDescription}
            </p>
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

/** 穿搭效果图：人物头像 + 穿搭可视化 */
function OutfitImage({
  outfit,
  styleLabel,
}: {
  outfit: GenerateOutfitResponse;
  styleLabel: string;
}) {
  const { currentUser } = useAppStore();
  const [imgError, setImgError] = useState(false);

  const gradients = [
    'from-purple-500 via-pink-500 to-amber-500',
    'from-blue-500 via-purple-500 to-rose-500',
    'from-emerald-500 via-teal-500 to-blue-500',
    'from-amber-500 via-orange-500 to-red-500',
  ];
  const bg = gradients[styleLabel.length % gradients.length];

  return (
    <div className={`aspect-[4/5] relative bg-gradient-to-br ${bg} p-6 flex flex-col items-center justify-center text-white overflow-hidden`}>
      {/* 装饰 */}
      <div className="absolute top-6 right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute bottom-16 left-4 w-20 h-20 rounded-full bg-white/10" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* 人物头像 */}
        <div className="w-24 h-24 rounded-full border-3 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center shadow-xl">
          {currentUser?.frontPhoto && !imgError ? (
            <img
              src={currentUser.frontPhoto}
              alt={currentUser.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : currentUser?.gender === 'female' ? (
            <span className="text-4xl">👩</span>
          ) : currentUser?.gender === 'male' ? (
            <span className="text-4xl">👨</span>
          ) : (
            <span className="text-4xl">🧑</span>
          )}
        </div>

        {/* 名字 */}
        <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
          {currentUser?.name || '用户'}
        </span>

        {/* 身体数据 */}
        <div className="flex gap-2 text-xs opacity-80">
          {currentUser?.height && <span>{currentUser.height}cm</span>}
          {currentUser?.weight && <span>{currentUser.weight}kg</span>}
          {currentUser?.bodyType && <span>{currentUser.bodyType}</span>}
        </div>

        {/* 风格标签 */}
        <div className="text-center">
          <div className="text-3xl mb-1">✨</div>
          <div className="text-lg font-bold">{styleLabel}风格穿搭</div>
        </div>

        {/* 穿搭描述 */}
        <p className="text-xs text-center text-white/80 leading-relaxed max-w-[260px] line-clamp-3">
          {outfit.outfitDescription}
        </p>
      </div>

      {/* 底部标签 */}
      <div className="absolute bottom-3 text-[10px] text-white/50">
        SmartWardrobe AI · 穿搭效果预览
      </div>
    </div>
  );
}
