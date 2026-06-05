'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, Home, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/closet', label: '衣帽间', icon: Shirt },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
      <div className="p-4 md:p-6">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              SmartWardrobe
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">智能穿搭助手</p>
          </div>
        </Link>
      </div>

      <nav className="px-3 pb-4 md:pb-6">
        <ul className="flex md:flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline',
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden md:block px-6 pb-6 mt-auto">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 border border-purple-100 dark:border-purple-900/30">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
            ✨ AI 智能搭配
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            根据天气和衣帽间，一键生成专属穿搭
          </p>
        </div>
      </div>
    </aside>
  );
}
