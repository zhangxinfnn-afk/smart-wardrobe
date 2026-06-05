'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Search, Settings, UserPlus, ChevronDown, User } from 'lucide-react';
import { CategoryTabs } from '@/components/closet/CategoryTabs';
import { ClothingGrid } from '@/components/closet/ClothingGrid';
import { UploadModal } from '@/components/closet/UploadModal';
import { BatchUploadModal } from '@/components/closet/BatchUploadModal';
import { UserCreateModal } from '@/components/home/UserCreateModal';
import { UserEditModal } from '@/components/home/UserEditModal';
import { useAppStore } from '@/stores/useAppStore';
import { useClosetStore } from '@/stores/useClosetStore';
import type { ClothingItem, ClothingFormData, Category, Season, Style, User as UserType } from '@/types';
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);

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

  const handleUserCreated = (user: UserType) => {
    addUser(user);
    setCurrentUser(user);
    fetchClothes();
  };

  const handleUserUpdated = (updatedUser: UserType) => {
    // 更新 store 中的用户列表
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
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
              {/* User dropdown select */}
              <div className="flex items-center gap-1">
                <div className="relative">
                  <select
                    value={currentUser?.id || ''}
                    onChange={(e) => {
                      const user = users.find((u) => u.id === e.target.value);
                      if (user) setCurrentUser(user);
                    }}
                    className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {users.length === 0 && (
                      <option value="">请先创建用户</option>
                    )}
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Settings button */}
                {currentUser && (
                  <button
                    onClick={() => setEditUser(currentUser)}
                    className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    title="编辑用户信息"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}

                {/* Add user button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  title="添加新用户"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
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
            <User className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              还没有用户
            </h2>
            <p className="text-gray-500 mb-4">请先创建一个用户来管理衣帽间</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />
              创建用户
            </button>
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

      {/* User Create/Edit Modals */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleUserCreated}
      />

      {editUser && (
        <UserEditModal
          user={editUser}
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          onUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}
