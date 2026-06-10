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

import { useState as useStateImg, useEffect as useEffectImg, useRef } from 'react';

/** 穿搭效果图：Canvas 绘制人物穿搭可视化 */
function OutfitImage({
  imageUrl: _imageUrl,
  outfit,
  styleLabel,
}: {
  imageUrl: string | null;
  outfit: GenerateOutfitResponse;
  styleLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffectImg(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // 背景渐变
    const gradients = [
      ['#7c3aed', '#a855f7', '#f59e0b'],
      ['#2563eb', '#7c3aed', '#f43f5e'],
      ['#059669', '#14b8a6', '#3b82f6'],
      ['#d97706', '#ea580c', '#dc2626'],
    ];
    const [c1, c2, c3] = gradients[styleLabel.length % gradients.length];
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, c1);
    bg.addColorStop(0.5, c2);
    bg.addColorStop(1, c3);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 装饰
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(W * 0.8, H * 0.15, 60, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.2, H * 0.8, 50, 0, Math.PI * 2); ctx.fill();

    // 人物剪影
    const cx = W / 2;
    const cy = H * 0.45;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    // 头
    ctx.beginPath(); ctx.arc(cx, cy - 90, 28, 0, Math.PI * 2); ctx.fill();
    // 身体
    ctx.beginPath(); ctx.moveTo(cx - 22, cy - 50); ctx.lineTo(cx - 28, cy + 60);
    ctx.lineTo(cx + 28, cy + 60); ctx.lineTo(cx + 22, cy - 50); ctx.closePath(); ctx.fill();
    // 腿
    ctx.fillRect(cx - 20, cy + 60, 12, 80);
    ctx.fillRect(cx + 8, cy + 60, 12, 80);

    // 衣服高亮区域
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.moveTo(cx - 18, cy - 45); ctx.lineTo(cx - 24, cy + 20);
    ctx.lineTo(cx + 24, cy + 20); ctx.lineTo(cx + 18, cy - 45); ctx.closePath(); ctx.fill();

    // 底部信息
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, H - 120, W, 120);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ ${styleLabel}风格穿搭`, cx, H - 80);

    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const desc = outfit.outfitDescription.slice(0, 60);
    ctx.fillText(desc + (outfit.outfitDescription.length > 60 ? '...' : ''), cx, H - 55);

    // 天气标签
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('由 SmartWardrobe AI 生成', cx, H - 20);

    // 顶部标题
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('穿搭效果预览', 24, 36);
  }, [outfit, styleLabel]);

  return (
    <div className="aspect-[3/4] relative rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        className="w-full h-full"
      />
    </div>
  );
}
