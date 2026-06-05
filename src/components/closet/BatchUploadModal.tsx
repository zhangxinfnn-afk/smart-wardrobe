'use client';

import { useState } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { CATEGORIES, SEASONS, STYLES } from '@/types';
import type { Category, Season, Style } from '@/types';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { cn } from '@/lib/utils';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    files: File[],
    itemData: Array<{
      name: string;
      category: Category;
      season: Season[];
      style: Style[];
    }>
  ) => Promise<void>;
}

export function BatchUploadModal({
  isOpen,
  onClose,
  onSave,
}: BatchUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<Category>('TOP');
  const [season, setSeason] = useState<Season[]>([]);
  const [style, setStyle] = useState<Style[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const toggleArray = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleClose = () => {
    setFiles([]);
    setCategory('TOP');
    setSeason([]);
    setStyle([]);
    setProgress(0);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('请选择至少一张图片');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const itemData = files.map((file) => ({
        name: file.name.replace(/\.[^.]+$/, ''),
        category,
        season,
        style,
      }));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 300);

      await onSave(files, itemData);

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(handleClose, 500);
    } catch {
      setError('批量上传失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              批量上传
            </h2>
            <p className="text-sm text-gray-500">一次上传多件衣物</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Multi Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择照片
            </label>
            <MultiImageUpload files={files} onFilesChange={setFiles} />
          </div>

          {/* Batch settings */}
          {files.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Tag className="w-4 h-4" />
                批量设置属性（应用于所有图片）
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分类
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CATEGORIES.slice(0, 12).map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        'px-2 py-1.5 text-xs rounded-lg border transition-colors',
                        category === cat.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  适用季节
                </label>
                <div className="flex gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSeason(toggleArray(season, s.value))}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        season.includes(s.value)
                          ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  风格
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.slice(0, 8).map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(toggleArray(style, s.value))}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-lg border transition-colors',
                        style.includes(s.value)
                          ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Progress */}
          {saving && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  上传中...
                </span>
                <span className="text-purple-600 font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || files.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '上传中...' : `上传 ${files.length} 件衣物`}
          </button>
        </div>
      </div>
    </div>
  );
}
