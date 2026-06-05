'use client';

import { useState, useEffect } from 'react';
import { CityWeather } from '@/components/home/CityWeather';
import { ProfileSwitcher } from '@/components/home/ProfileSwitcher';
import { StyleSelector } from '@/components/home/StyleSelector';
import { OutfitGenerator } from '@/components/home/OutfitGenerator';
import { PoseGenerator } from '@/components/home/PoseGenerator';
import { useAppStore } from '@/stores/useAppStore';
import type { GenerateOutfitResponse } from '@/types';

export default function HomePage() {
  const { setUsers, setCurrentUser, currentUser } = useAppStore();
  const [outfit, setOutfit] = useState<GenerateOutfitResponse | null>(null);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          if (data.length > 0 && !currentUser) {
            setCurrentUser(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top Bar - Weather + Profile */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CityWeather />
            <ProfileSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Style Selector */}
        <div className="mb-8">
          <StyleSelector />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 1: AI Outfit Generation */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                功能一：智能穿搭搭配
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                根据 {currentUser?.name || '选择的对象'} 的衣帽间，结合
                天气和风格，AI 自动生成穿搭
              </p>
            </div>
            <OutfitGenerator
              onOutfitGenerated={setOutfit}
              currentOutfit={outfit}
            />
          </div>

          {/* Feature 2: Pose Generation */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                功能二：景点拍照姿势
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                选择城市景点，AI 生成穿搭 + 景点 + 姿势的拍照参考
              </p>
            </div>
            <PoseGenerator
              outfitDescription={outfit?.outfitDescription || null}
              disabled={!outfit}
            />
          </div>
        </div>

        {/* Empty state for first-time users */}
        {!outfit && (
          <div className="mt-8 text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-amber-100 dark:from-purple-900/20 dark:to-amber-900/20 flex items-center justify-center">
              <span className="text-4xl">👆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              开始你的智能穿搭之旅
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              先到衣帽间添加你的衣物，然后回到这里，选择城市、风格，
              点击「智能搭配」按钮，AI 将为你生成专属穿搭！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
