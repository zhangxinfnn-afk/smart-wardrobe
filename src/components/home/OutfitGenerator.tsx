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

export function OutfitGenerator({
  onOutfitGenerated,
  currentOutfit,
}: OutfitGeneratorProps) {
  const { currentUser, currentCity, currentStyle, weather } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const styleLabel = STYLES.find((s) => s.value === currentStyle)?.label || currentStyle;

  const handleGenerate = async () => {
    if (!currentUser) { setError('请先选择穿搭对象'); return; }
    if (!weather) { setError('天气数据加载中，请稍后'); return; }
    setGenerating(true); setError('');
    try {
      const res = await fetch('/api/generate/outfit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, cityName: currentCity.name, style: currentStyle, weather }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '生成失败'); }
      onOutfitGenerated(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally { setGenerating(false); }
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
            <RefreshCw className="w-4 h-4" />换一套</button>
        )}
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
      {currentOutfit && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <OutfitCanvas outfit={currentOutfit} styleLabel={styleLabel} />
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✨ {styleLabel}风格 · {weather?.city || currentCity.name} 穿搭</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentOutfit.outfitDescription}</p>
            {currentOutfit.selectedItems?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentOutfit.selectedItems.map((si, i) => (
                  <span key={i} className="inline-block px-2.5 py-1 text-xs rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">{si.reason}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Canvas 模拟穿搭：人物照片 + 衣物透视合成 */
function OutfitCanvas({ outfit, styleLabel }: { outfit: GenerateOutfitResponse; styleLabel: string }) {
  const { currentUser } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outfit.selectedItems?.length || !currentUser) { setLoading(false); return; }
    const ids = outfit.selectedItems.map(s => s.id);
    fetch(`/api/clothes?userId=${currentUser.id}`)
      .then(r => r.json())
      .then((items: ClothingItem[]) => {
        setClothes(items.filter(c => ids.includes(c.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [outfit, currentUser]);

  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = 600;
    const H = canvas.height = 800;

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const draw = async () => {
      // 背景 — 时尚影棚风格
      const bg = ctx.createRadialGradient(W/2, H*0.4, 50, W/2, H*0.4, 600);
      bg.addColorStop(0, '#f8f9fa');
      bg.addColorStop(1, '#ced4da');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 分类衣物
      const top = clothes.find(c => c.category === 'TOP' || c.category === 'DRESS' || c.category === 'OUTERWEAR');
      const bottom = clothes.find(c => c.category === 'BOTTOM');
      const shoe = clothes.find(c => c.category === 'SHOES');
      const acc = clothes.find(c => ['HAT','SCARF','JEWELRY','GLASSES'].includes(c.category));

      // ====== 绘制人物照片作为底图 ======
      const photoSrc = currentUser?.frontPhoto;
      if (photoSrc) {
        try {
          const photo = await loadImg(photoSrc);

          // 计算人物在画布上的位置（居中偏上）
          const personW = 260, personH = 380;
          const personX = (W - personW) / 2, personY = 100;

          // 绘制人物照片
          ctx.save();
          const pr = 20;
          ctx.beginPath();
          ctx.moveTo(personX + pr, personY);
          ctx.lineTo(personX + personW - pr, personY);
          ctx.quadraticCurveTo(personX + personW, personY, personX + personW, personY + pr);
          ctx.lineTo(personX + personW, personY + personH - pr);
          ctx.quadraticCurveTo(personX + personW, personY + personH, personX + personW - pr, personY + personH);
          ctx.lineTo(personX + pr, personY + personH);
          ctx.quadraticCurveTo(personX, personY + personH, personX, personY + personH - pr);
          ctx.lineTo(personX, personY + pr);
          ctx.quadraticCurveTo(personX, personY, personX + pr, personY);
          ctx.closePath();
          ctx.clip();

          // 缩放照片填满人物区域
          const scale = Math.max(personW / photo.width, personH / photo.height);
          const sw = photo.width * scale, sh = photo.height * scale;
          ctx.drawImage(photo, personX + (personW - sw) / 2, personY + (personH - sh) / 2, sw, sh);
          ctx.restore();

          // ====== 上衣叠加（半透明区域提示） ======
          if (top?.imageUrl?.startsWith('data:')) {
            try {
              const topImg = await loadImg(top.imageUrl);
              // 衣服放在人物上半身
              const tx = personX + 20, ty = personY + 20;
              const tw = personW - 40, th = personH * 0.45;

              ctx.save();
              ctx.globalAlpha = 0.55;
              ctx.beginPath();
              const tr = 8;
              ctx.moveTo(tx + tr, ty);
              ctx.lineTo(tx + tw - tr, ty);
              ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + tr);
              ctx.lineTo(tx + tw, ty + th - tr);
              ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - tr, ty + th);
              ctx.lineTo(tx + tr, ty + th);
              ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - tr);
              ctx.lineTo(tx, ty + tr);
              ctx.quadraticCurveTo(tx, ty, tx + tr, ty);
              ctx.closePath();
              ctx.clip();
              const tScale = Math.max(tw / topImg.width, th / topImg.height);
              ctx.drawImage(topImg, tx + (tw - topImg.width * tScale) / 2, ty + (th - topImg.height * tScale) / 2, topImg.width * tScale, topImg.height * tScale);
              ctx.restore();
            } catch {}
          }

          // ====== 下装叠加 ======
          if (bottom?.imageUrl?.startsWith('data:')) {
            try {
              const btmImg = await loadImg(bottom.imageUrl);
              const bx = personX + 25, by = personY + personH * 0.48;
              const bw = personW - 50, bh = personH * 0.45;

              ctx.save();
              ctx.globalAlpha = 0.55;
              ctx.beginPath();
              const br = 8;
              ctx.moveTo(bx + br, by); ctx.lineTo(bx + bw - br, by);
              ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
              ctx.lineTo(bx + bw, by + bh - br);
              ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
              ctx.lineTo(bx + br, by + bh);
              ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
              ctx.lineTo(bx, by + br);
              ctx.quadraticCurveTo(bx, by, bx + br, by);
              ctx.closePath();
              ctx.clip();
              const bScale = Math.max(bw / btmImg.width, bh / btmImg.height);
              ctx.drawImage(btmImg, bx + (bw - btmImg.width * bScale) / 2, by + (bh - btmImg.height * bScale) / 2, btmImg.width * bScale, btmImg.height * bScale);
              ctx.restore();
            } catch {}
          }

          // ====== 鞋子叠加 ======
          if (shoe?.imageUrl?.startsWith('data:')) {
            try {
              const shoeImg = await loadImg(shoe.imageUrl);
              const sx = personX + 60, sy = personY + personH - 50;
              const sww = personW - 120, sh = 55;

              ctx.save();
              ctx.globalAlpha = 0.6;
              ctx.beginPath();
              const sr = 6;
              ctx.moveTo(sx + sr, sy); ctx.lineTo(sx + sww - sr, sy);
              ctx.quadraticCurveTo(sx + sww, sy, sx + sww, sy + sr);
              ctx.lineTo(sx + sww, sy + sh - sr);
              ctx.quadraticCurveTo(sx + sww, sy + sh, sx + sww - sr, sy + sh);
              ctx.lineTo(sx + sr, sy + sh);
              ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh - sr);
              ctx.lineTo(sx, sy + sr);
              ctx.quadraticCurveTo(sx, sy, sx + sr, sy);
              ctx.closePath();
              ctx.clip();
              const sScale = Math.max(sww / shoeImg.width, sh / shoeImg.height);
              ctx.drawImage(shoeImg, sx + (sww - shoeImg.width * sScale) / 2, sy + (sh - shoeImg.height * sScale) / 2, shoeImg.width * sScale, shoeImg.height * sScale);
              ctx.restore();
            } catch {}
          }

        } catch { /* 人物照片加载失败 */ }
      }

      // 没有人物照片时的降级展示
      if (!photoSrc) {
        ctx.fillStyle = '#adb5bd';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('请先上传人物正面照', W/2, H/2 - 20);
        ctx.fillText('（衣帽间 → 用户设置 → 上传照片）', W/2, H/2 + 20);
      }

      // 底部信息
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, H - 55, W, 55);
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`👤 ${currentUser?.name || ''}  |  ${styleLabel}风格  |  SmartWardrobe AI 模拟穿搭`, W/2, H - 22);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('效果仅供参考 · 半透明区域为衣物叠加示意', W/2, H - 6);
    };

    draw();
  }, [clothes, loading, currentUser, styleLabel]);

  // 有 DALL-E 生成的图片，直接展示
  if (outfit.generatedImageUrl) {
    return (
      <div className="aspect-[3/4] relative">
        <img src={outfit.generatedImageUrl} alt="AI 穿搭效果图" className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 text-[10px] text-white/70 bg-black/40 px-2 py-1 rounded">DALL-E AI 生成</div>
      </div>
    );
  }

  if (loading) {
    return <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
        <span className="text-sm text-gray-400">加载中...</span>
      </div>
    </div>;
  }

  return (
    <canvas ref={canvasRef} className="w-full aspect-[3/4]" width={600} height={800} />
  );
}
