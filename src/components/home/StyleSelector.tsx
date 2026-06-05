'use client';

import { STYLES } from '@/types';
import type { Style } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export function StyleSelector() {
  const { currentStyle, setCurrentStyle } = useAppStore();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          穿搭风格
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => setCurrentStyle(s.value)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              currentStyle === s.value
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
            )}
            title={s.desc}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
