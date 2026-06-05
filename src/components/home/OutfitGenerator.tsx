'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, ImageIcon } from 'lucide-react';
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
          <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-700">
            {currentOutfit.generatedImageUrl ? (
              <img
                src={currentOutfit.generatedImageUrl}
                alt="AI 生成的穿搭效果"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">AI 效果图生成中...</p>
                <p className="text-xs mt-1">（配置 Stable Diffusion API 后将显示效果图）</p>
              </div>
            )}
          </div>

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
