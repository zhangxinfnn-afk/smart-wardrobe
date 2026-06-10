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

/** Canvas 合成：用户头像 + 衣物图片 → 穿搭效果图 */
function OutfitCanvas({ outfit, styleLabel }: { outfit: GenerateOutfitResponse; styleLabel: string }) {
  const { currentUser } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载被选中的衣物数据
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

  // Canvas 绘制
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = 600;
    const H = canvas.height = 800;
    ctx.clearRect(0, 0, W, H);

    // 背景
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f8f9fa'); bg.addColorStop(0.5, '#e9ecef'); bg.addColorStop(1, '#dee2e6');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 加载图片的辅助函数
    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    // 获取要绘制的图片源
    const photoSrc = currentUser?.frontPhoto;
    const clothingPics = clothes.filter(c => c.imageUrl && c.imageUrl.startsWith('data:')).slice(0, 4);

    // 绘制函数
    const draw = async () => {
      // 标题
      ctx.fillStyle = '#495057';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${styleLabel}风格穿搭`, W / 2, 50);

      // 副标题
      ctx.fillStyle = '#868e96';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const date = new Date().toLocaleDateString('zh-CN', { month:'long', day:'numeric', weekday:'short' });
      ctx.fillText(`${currentUser?.name || '用户'} · ${date}`, W / 2, 78);

      // 用户照片
      if (photoSrc) {
        try {
          const photo = await loadImg(photoSrc);
          const pw = 200, ph = 260, px = 40, py = 110;
          // 圆角矩形裁剪
          ctx.save();
          ctx.beginPath();
          const r = 16;
          ctx.moveTo(px + r, py); ctx.lineTo(px + pw - r, py);
          ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
          ctx.lineTo(px + pw, py + ph - r);
          ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
          ctx.lineTo(px + r, py + ph);
          ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
          ctx.lineTo(px, py + r);
          ctx.quadraticCurveTo(px, py, px + r, py);
          ctx.closePath();
          ctx.clip();
          // 填充并绘制
          const scale = Math.max(pw / photo.width, ph / photo.height);
          const sw = photo.width * scale, sh = photo.height * scale;
          const sx = px + (pw - sw) / 2, sy = py + (ph - sh) / 2;
          ctx.drawImage(photo, sx, sy, sw, sh);
          ctx.restore();
          // 标签
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(px, py + ph - 30, pw, 30);
          ctx.fillStyle = '#fff';
          ctx.font = '13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👤 穿搭对象', px + pw / 2, py + ph - 10);
        } catch { /* 图片加载失败，跳过 */ }
      }

      // 衣物照片（右侧竖向排列）
      if (clothingPics.length > 0) {
        const startX = 270, startY = 110;
        const itemW = 290, itemH = 150;
        const gap = 8;

        for (let i = 0; i < Math.min(clothingPics.length, 4); i++) {
          try {
            const img = await loadImg(clothingPics[i].imageUrl);
            const y = startY + i * (itemH + gap);
            ctx.save();
            ctx.beginPath();
            const rr = 12;
            const x = startX;
            ctx.moveTo(x + rr, y); ctx.lineTo(x + itemW - rr, y);
            ctx.quadraticCurveTo(x + itemW, y, x + itemW, y + rr);
            ctx.lineTo(x + itemW, y + itemH - rr);
            ctx.quadraticCurveTo(x + itemW, y + itemH, x + itemW - rr, y + itemH);
            ctx.lineTo(x + rr, y + itemH);
            ctx.quadraticCurveTo(x, y + itemH, x, y + itemH - rr);
            ctx.lineTo(x, y + rr);
            ctx.quadraticCurveTo(x, y, x + rr, y);
            ctx.closePath();
            ctx.clip();
            const scale = Math.max(itemW / img.width, itemH / img.height);
            const sw = img.width * scale, sh = img.height * scale;
            const sx = x + (itemW - sw) / 2, sy = y + (itemH - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh);
            ctx.restore();
            // 衣物名称标签
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(x, y + itemH - 24, itemW, 24);
            ctx.fillStyle = '#fff';
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'left';
            const name = clothingPics[i].name.replace(/\.[^.]+$/, '').slice(0, 25);
            ctx.fillText(`👕 ${name}`, x + 8, y + itemH - 8);
          } catch { /* skip */ }
        }
      }

      // 如果没有衣物图片，显示文字列表
      if (clothingPics.length === 0) {
        const itemY = 140;
        ctx.fillStyle = '#495057';
        ctx.font = '15px system-ui, sans-serif';
        ctx.textAlign = 'left';
        const ids = outfit.selectedItems?.map(s => s.id) || [];
        const matched = clothes.filter(c => ids.includes(c.id));
        matched.slice(0, 5).forEach((item, i) => {
          const name = (item.name || '衣物').replace(/\.[^.]+$/, '');
          ctx.fillText(`${i + 1}. ${name}`, 270, itemY + i * 28);
        });
      }

      // 底部信息栏
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, H - 60, W, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const stats = [
        currentUser?.height ? `${currentUser.height}cm` : '',
        currentUser?.weight ? `${currentUser.weight}kg` : '',
        currentUser?.bodyType || '',
      ].filter(Boolean).join(' · ');
      ctx.fillText(`${currentUser?.name || ''}  ${stats}  |  ${styleLabel}穿搭  |  SmartWardrobe AI`, W / 2, H - 28);

      // 底部小字
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('由 AI 搭配生成 · 效果仅供参考', W / 2, H - 10);
    };

    draw();
  }, [clothes, loading, currentUser, styleLabel, outfit]);

  if (loading) {
    return (
      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
          <span className="text-sm text-gray-400">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
      <canvas ref={canvasRef} className="w-full h-full" width={600} height={800} />
    </div>
  );
}
