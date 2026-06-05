'use client';

import type { ClothingItem } from '@/types';
import { ClothingCard } from './ClothingCard';
import { PackageOpen } from 'lucide-react';

interface ClothingGridProps {
  items: ClothingItem[];
  loading: boolean;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
}

export function ClothingGrid({
  items,
  loading,
  onEdit,
  onDelete,
  onToggleFavorite,
}: ClothingGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <PackageOpen className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">衣帽间空空如也</p>
        <p className="text-sm mt-1">点击上方按钮添加你的第一件衣物吧 ✨</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <ClothingCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
