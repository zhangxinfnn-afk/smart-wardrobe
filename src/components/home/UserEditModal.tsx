'use client';

import { useState, useEffect } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { GENDERS, BODY_TYPES } from '@/types';
import type { User, BodyType } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface UserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

export function UserEditModal({ user, isOpen, onClose, onUpdated }: UserEditModalProps) {
  const { setCurrentUser } = useAppStore();
  const [name, setName] = useState(user.name);
  const [gender, setGender] = useState(user.gender || '');
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [height, setHeight] = useState(user.height?.toString() || '');
  const [weight, setWeight] = useState(user.weight?.toString() || '');
  const [age, setAge] = useState(user.age?.toString() || '');
  const [bodyType, setBodyType] = useState<BodyType | ''>((user.bodyType as BodyType) || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setGender(user.gender || '');
      setFrontPhoto(null);
      setSidePhoto(null);
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setAge(user.age?.toString() || '');
      setBodyType((user.bodyType as BodyType) || '');
      setError('');
    }
  }, [isOpen, user]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请输入姓名');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('gender', gender);
      if (height) formData.append('height', height);
      if (weight) formData.append('weight', weight);
      if (age) formData.append('age', age);
      if (bodyType) formData.append('bodyType', bodyType);
      if (frontPhoto) formData.append('frontPhoto', frontPhoto);
      if (sidePhoto) formData.append('sidePhoto', sidePhoto);

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update');

      const updatedUser = await res.json();
      onUpdated(updatedUser);
      setCurrentUser(updatedUser);
      onClose();
    } catch {
      setError('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {user.frontPhoto ? (
              <img src={user.frontPhoto} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-purple-200" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">编辑信息</h2>
              <p className="text-xs text-gray-500">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">性别</label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    gender === g.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400')}
                >{g.label}</button>
              ))}
            </div>
          </div>

          {/* Photos side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">正面照</label>
              <ImageUpload value={frontPhoto} onChange={setFrontPhoto}
                previewUrl={!frontPhoto ? user.frontPhoto || undefined : undefined}
                className="aspect-[3/4] max-h-40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">侧面照 <span className="text-xs text-gray-400">可选</span></label>
              <ImageUpload value={sidePhoto} onChange={setSidePhoto}
                previewUrl={!sidePhoto ? user.sidePhoto || undefined : undefined}
                className="aspect-[3/4] max-h-40" />
            </div>
          </div>

          {/* Body data */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">身高 (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">体重 (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">年龄</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>

          {/* Body type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">身材类型</label>
            <div className="flex flex-wrap gap-2">
              {BODY_TYPES.map((bt) => (
                <button key={bt.value} onClick={() => setBodyType(bodyType === bt.value ? '' : bt.value)}
                  className={cn('px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    bodyType === bt.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400')}
                >{bt.label}</button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
