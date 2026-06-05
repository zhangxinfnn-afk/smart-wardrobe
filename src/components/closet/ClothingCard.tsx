'use client';

import type { ClothingItem } from '@/types';
import { CATEGORIES, STYLES } from '@/types';
import { Edit2, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClothingCardProps {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
}

export function ClothingCard({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
}: ClothingCardProps) {
  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label || item.category;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-sm">暂无图片</span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(item.id, !item.isFavorite)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
        >
          <Star
            className={cn(
              'w-4 h-4',
              item.isFavorite
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-400'
            )}
          />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onEdit(item)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {item.name}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {categoryLabel}
          </span>
        </div>

        {item.colors && item.colors.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {item.colors.map((color, i) => (
              <span
                key={i}
                className="inline-block px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                {color}
              </span>
            ))}
          </div>
        )}

        {item.style && item.style.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.style.slice(0, 2).map((s) => {
              const label = STYLES.find((st) => st.value === s)?.label || s;
              return (
                <span
                  key={s}
                  className="inline-block px-1.5 py-0.5 text-[10px] rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
