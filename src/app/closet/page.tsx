'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Search, Filter, Users } from 'lucide-react';
import { CategoryTabs } from '@/components/closet/CategoryTabs';
import { ClothingGrid } from '@/components/closet/ClothingGrid';
import { UploadModal } from '@/components/closet/UploadModal';
import { BatchUploadModal } from '@/components/closet/BatchUploadModal';
import { useAppStore } from '@/stores/useAppStore';
import { useClosetStore } from '@/stores/useClosetStore';
import type { ClothingItem, ClothingFormData, Category, Season, Style, User } from '@/types';
import { SEASONS, STYLES } from '@/types';

export default function ClosetPage() {
  const { currentUser, users, setCurrentUser, setUsers, addUser } = useAppStore();
  const {
    selectedCategory,
    selectedSeason,
    selectedStyle,
    searchQuery,
    showUploadModal,
    showBatchUpload,
    setSelectedCategory,
    setSelectedSeason,
    setSelectedStyle,
    setSearchQuery,
    setShowUploadModal,
    setShowBatchUpload,
    editingItem,
    setEditingItem,
  } = useClosetStore();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        if (!currentUser && data.length > 0) {
          setCurrentUser(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [currentUser, setCurrentUser, setUsers]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch clothes
  const fetchClothes = useCallback(async () => {
    if (!currentUser) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ userId: currentUser.id });
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (selectedSeason !== 'ALL') params.set('season', selectedSeason);
      if (selectedStyle !== 'ALL') params.set('style', selectedStyle);

      const res = await fetch(`/api/clothes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch clothes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedCategory, selectedSeason, selectedStyle]);

  useEffect(() => {
    fetchClothes();
  }, [fetchClothes]);

  // Handlers
  const handleSaveClothing = async (data: ClothingFormData, imageFile: File | null) => {
    if (editingItem) {
      // Update existing
      const res = await fetch(`/api/clothes/${editingItem}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
    } else {
      // Create new
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/clothes', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to create');
    }

    setEditingItem(null);
    fetchClothes();
  };

  const handleBatchSave = async (
    files: File[],
    itemDataList: Array<{ name: string; category: Category; season: Season[]; style: Style[] }>
  ) => {
    if (!currentUser) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append(
      'data',
      JSON.stringify({ userId: currentUser.id, items: itemDataList })
    );

    const res = await fetch('/api/clothes/batch', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Batch upload failed');
    fetchClothes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这件衣物吗？')) return;
    const res = await fetch(`/api/clothes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchClothes();
  };

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    await fetch(`/api/clothes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: favorite }),
    });
    fetchClothes();
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    const formData = new FormData();
    formData.append('name', newUserName.trim());

    const res = await fetch('/api/users', { method: 'POST', body: formData });
    if (res.ok) {
      const user = await res.json();
      addUser(user);
      setCurrentUser(user);
      setNewUserName('');
      setShowNewUser(false);
    }
  };

  const editItemData = editingItem
    ? items.find((i) => i.id === editingItem)
    : null;

  // Compute category counts
  const categoryCounts = items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                衣帽间
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                管理你的衣物、配饰和鞋履
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* User switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowNewUser(!showNewUser)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentUser?.name || '选择用户'}
                  </span>
                </button>

                {showNewUser && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-10">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setShowNewUser(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {user.name}
                        {currentUser?.id === user.id && ' ✓'}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="新用户名称"
                          className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none"
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleCreateUser()
                          }
                        />
                        <button
                          onClick={handleCreateUser}
                          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload buttons */}
              <button
                onClick={() => setShowBatchUpload(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">批量上传</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowUploadModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">添加衣物</span>
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索衣物名称、品牌..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              {/* Season filter */}
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value as Season | 'ALL')}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none"
              >
                <option value="ALL">全部季节</option>
                {SEASONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* Style filter */}
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as Style | 'ALL')}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none"
              >
                <option value="ALL">全部风格</option>
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4">
            <CategoryTabs
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              counts={categoryCounts}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-6">
        {!currentUser ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              还没有用户
            </h2>
            <p className="text-gray-500 mb-4">请先创建一个用户来管理衣帽间</p>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="输入名称"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
              />
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                创建
              </button>
            </div>
          </div>
        ) : (
          <ClothingGrid
            items={items.filter(
              (item) =>
                !searchQuery ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            loading={loading}
            onEdit={(item) => {
              setEditingItem(item.id);
              setShowUploadModal(true);
            }}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveClothing}
        userId={currentUser?.id || ''}
        editItem={
          editItemData
            ? {
                id: editItemData.id,
                name: editItemData.name,
                category: editItemData.category,
                subcategory: editItemData.subcategory,
                color: editItemData.color,
                colors: editItemData.colors,
                season: editItemData.season,
                style: editItemData.style,
                imageUrl: editItemData.imageUrl,
                brand: editItemData.brand,
                notes: editItemData.notes,
              }
            : null
        }
      />

      <BatchUploadModal
        isOpen={showBatchUpload}
        onClose={() => setShowBatchUpload(false)}
        onSave={handleBatchSave}
      />
    </div>
  );
}
