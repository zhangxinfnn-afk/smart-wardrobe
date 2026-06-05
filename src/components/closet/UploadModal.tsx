'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CATEGORIES, SEASONS, STYLES } from '@/types';
import type { Category, Season, Style, ClothingFormData } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClothingFormData, imageFile: File | null) => Promise<void>;
  userId: string;
  editItem?: {
    id: string;
    name: string;
    category: Category;
    subcategory?: string | null;
    color?: string | null;
    colors: string[];
    season: Season[];
    style: Style[];
    imageUrl?: string;
    brand?: string | null;
    notes?: string | null;
  } | null;
}

export function UploadModal({
  isOpen,
  onClose,
  onSave,
  userId,
  editItem,
}: UploadModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('TOP');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [season, setSeason] = useState<Season[]>([]);
  const [style, setStyle] = useState<Style[]>([]);
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setSubcategory(editItem.subcategory || '');
      setColor(editItem.color || '');
      setColors(editItem.colors || []);
      setSeason(editItem.season || []);
      setStyle(editItem.style || []);
      setBrand(editItem.brand || '');
      setNotes(editItem.notes || '');
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [editItem, isOpen]);

  const resetForm = () => {
    setName('');
    setCategory('TOP');
    setSubcategory('');
    setColor('');
    setColors([]);
    setSeason([]);
    setStyle([]);
    setBrand('');
    setNotes('');
    setImageFile(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && color.trim()) {
      e.preventDefault();
      if (!colors.includes(color.trim())) {
        setColors([...colors, color.trim()]);
      }
      setColor('');
    }
  };

  const removeColor = (c: string) => {
    setColors(colors.filter((cl) => cl !== c));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请输入衣物名称');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(
        {
          userId,
          category,
          subcategory: subcategory || undefined,
          name: name.trim(),
          color: colors[0] || undefined,
          colors,
          season,
          style,
          brand: brand || undefined,
          notes: notes || undefined,
        },
        imageFile
      );
      handleClose();
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editItem ? '编辑衣物' : '添加衣物'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              衣物照片
            </label>
            <ImageUpload
              value={imageFile}
              onChange={setImageFile}
              previewUrl={editItem?.imageUrl}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：白色亚麻衬衫"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分类
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.slice(0, 9).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'px-2 py-1.5 text-xs rounded-lg border transition-colors',
                    category === cat.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              子分类
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="如：T恤、衬衫、牛仔裤"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              颜色标签
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              onKeyDown={handleColorKeyDown}
              placeholder="输入颜色后按回车添加"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none mb-2"
            />
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  >
                    {c}
                    <button onClick={() => removeColor(c)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
                  onClick={() => setSeason(toggleArrayItem(season, s.value))}
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
              {STYLES.filter((s) => s.value !== 'BUSINESS').map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(toggleArrayItem(style, s.value))}
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

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              品牌
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="可选"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="购买渠道、价格、穿着感受等"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : editItem ? '更新' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
