'use client';

import { useState } from 'react';
import { Camera, MapPin, RefreshCw, Download } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { POSE_STYLES } from '@/types';
import type { PoseStyle, Landmark } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface PoseGeneratorProps {
  outfitDescription: string | null;
  disabled: boolean;
}

export function PoseGenerator({ outfitDescription, disabled }: PoseGeneratorProps) {
  const { currentCity, currentPoseStyle, setCurrentPoseStyle } = useAppStore();
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<{ pose: string; imageUrl: string }[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!outfitDescription || !selectedLandmark) {
      setError('请先选择景点');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/generate/pose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfitDescription,
          cityName: currentCity.name,
          landmark: selectedLandmark,
          poseStyle: currentPoseStyle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '生成失败');
      }

      const data = await res.json();
      setImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : '姿势照片生成失败');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            景点拍照姿势
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          选择 {currentCity.name} 的著名景点，生成旅行拍照姿势
        </p>
      </div>

      {/* Landmark selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          选择景点
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {currentCity.landmarks.map((landmark) => (
            <button
              key={landmark.name}
              onClick={() => setSelectedLandmark(landmark)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                selectedLandmark?.name === landmark.name
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {landmark.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {landmark.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pose style selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          拍照姿势风格
        </label>
        <div className="flex flex-wrap gap-2">
          {POSE_STYLES.map((ps) => (
            <button
              key={ps.value}
              onClick={() => setCurrentPoseStyle(ps.value)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                currentPoseStyle === ps.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              )}
              title={ps.desc}
            >
              {ps.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating || disabled || !selectedLandmark}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-all',
          generating || disabled || !selectedLandmark
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
        )}
      >
        {generating ? (
          <>
            <Spinner size="sm" className="border-white/30 border-t-white" />
            生成拍照姿势中...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            生成拍照姿势
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Result images */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              生成结果
            </h3>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重新生成
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                {img.imageUrl ? (
                  <div className="relative aspect-[3/4]">
                    <img
                      src={img.imageUrl}
                      alt={img.pose}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={img.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    未配置 AI 图片生成
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {img.pose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
