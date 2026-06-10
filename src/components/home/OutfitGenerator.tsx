'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Spinner } from '@/components/ui/Spinner';
import type { GenerateOutfitResponse, ClothingItem } from '@/types';
import { STYLES } from '@/types';
import { cn } from '@/lib/utils';

interface OutfitGeneratorProps {
  onOutfitGenerated: (outfit: GenerateOutfitResponse) => void;
  currentOutfit: GenerateOutfitResponse | null;
}

export function OutfitGenerator({ onOutfitGenerated, currentOutfit }: OutfitGeneratorProps) {
  const { currentUser, currentCity, currentStyle, weather } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const styleLabel = STYLES.find((s) => s.value === currentStyle)?.label || currentStyle;

  const handleGenerate = async () => {
    if (!currentUser) { setError('请先选择穿搭对象'); return; }
    if (!weather) { setError('天气数据加载中，请稍后'); return; }
    setGenerating(true); setError('');
    try {
      const res = await fetch('/api/generate/outfit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, cityName: currentCity.name, style: currentStyle, weather }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '生成失败'); }
      onOutfitGenerated(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : '生成失败'); }
    finally { setGenerating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={handleGenerate} disabled={generating || !currentUser || !weather}
          className={cn('flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-all',
            generating ? 'bg-purple-400 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-xl')}>
          {generating ? <><Spinner size="sm" className="border-white/30 border-t-white" />AI 搭配中...</> : <><Sparkles className="w-5 h-5" />智能搭配</>}
        </button>
        {currentOutfit && !generating && (
          <button onClick={handleGenerate} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
            <RefreshCw className="w-4 h-4" />换一套</button>)}
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
      {currentOutfit && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <OutfitImage outfit={currentOutfit} styleLabel={styleLabel} />
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✨ {styleLabel}风格 · {weather?.city || currentCity.name} 穿搭</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentOutfit.outfitDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** 效果图：优先显示豆包 AI 生成的图片，否则 Canvas */
function OutfitImage({ outfit, styleLabel }: { outfit: GenerateOutfitResponse; styleLabel: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const imageUrl = outfit.generatedImageUrl;

  if (imageUrl && !imgError) {
    return (
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {imgLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100 dark:bg-gray-700">
            <div className="w-10 h-10 rounded-full border-3 border-purple-300 border-t-purple-600 animate-spin mb-3" />
            <span className="text-sm text-gray-500">AI 正在生成穿搭照片...</span>
          </div>
        )}
        <img
          src={imageUrl}
          alt="AI 穿搭效果图"
          className="w-full h-full object-cover"
          onLoad={() => setImgLoading(false)}
          onError={() => { setImgLoading(false); setImgError(true); }}
        />
        {!imgLoading && (
          <div className="absolute bottom-2 left-2 text-[10px] text-white/60 bg-black/30 rounded px-2 py-1">豆包 AI 生成</div>
        )}
      </div>
    );
  }

  // 无图片或用不了 → Canvas 穿搭卡片
  return <OutfitCanvas outfit={outfit} styleLabel={styleLabel} />;
}

function OutfitCanvas({ outfit, styleLabel }: { outfit: GenerateOutfitResponse; styleLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const W = canvas.width = 600, H = canvas.height = 600;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#7c3aed'); bg.addColorStop(1, '#f59e0b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`✨ ${styleLabel}风格穿搭`, W/2, H/2 - 20);
    ctx.font = '14px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(outfit.outfitDescription.slice(0, 60) + '...', W/2, H/2 + 30);
    ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('SmartWardrobe AI · 效果参考', W/2, H/2 + 60);
  }, [outfit, styleLabel]);

  return <canvas ref={canvasRef} className="w-full aspect-square" width={600} height={600} />;
}
