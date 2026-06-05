'use client';

import { CATEGORIES } from '@/types';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import {
  Shirt, Footprints, Watch, SwatchBook, Circle, ChefHat, Gem,
  Glasses, Ellipsis, ShoppingBag, Shield, Backpack, Crown, SportShoe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Shirt, Footprints, SwatchBook, Circle, ChefHat, Gem,
  Glasses, Ellipsis, ShoppingBag, Shield, Watch, Backpack, Crown, SportShoe,
};

interface CategoryTabsProps {
  selected: Category | 'ALL';
  onSelect: (category: Category | 'ALL') => void;
  counts?: Record<string, number>;
}

export function CategoryTabs({ selected, onSelect, counts }: CategoryTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('ALL')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selected === 'ALL'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
        )}
      >
        全部
        {counts && (
          <span className="text-xs opacity-70">
            ({Object.values(counts).reduce((a, b) => a + b, 0)})
          </span>
        )}
      </button>

      {CATEGORIES.map((cat) => {
        const Icon = iconMap[cat.icon] || Ellipsis;
        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selected === cat.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            )}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
            {counts?.[cat.value] ? (
              <span className="text-xs opacity-70">({counts[cat.value]})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
