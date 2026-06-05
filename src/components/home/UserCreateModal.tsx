'use client';

import { useState } from 'react';
import { X, User, Camera, Save } from 'lucide-react';
import { GENDERS, BODY_TYPES } from '@/types';
import type { User as UserType, BodyType } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { cn } from '@/lib/utils';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: UserType) => void;
}

export function UserCreateModal({ isOpen, onClose, onCreated }: UserCreateModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bodyType, setBodyType] = useState<BodyType | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setGender('');
    setFrontPhoto(null);
    setSidePhoto(null);
    setHeight('');
    setWeight('');
    setAge('');
    setBodyType('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!gender) {
      setError('请选择性别');
      return;
    }
    if (!frontPhoto) {
      setError('请上传正面照片');
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
      formData.append('frontPhoto', frontPhoto);
      if (sidePhoto) formData.append('sidePhoto', sidePhoto);

      const res = await fetch('/api/users', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to create user');

      const user = await res.json();
      onCreated(user);
      handleClose();
    } catch {
      setError('创建失败，请重试');
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
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              创建用户
            </h2>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入姓名"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              性别 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    gender === g.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 正面照 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              正面照片 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">用于 AI 穿搭生成时的人像参考</p>
            <ImageUpload
              value={frontPhoto}
              onChange={setFrontPhoto}
              className="aspect-[3/4] max-h-48"
            />
          </div>

          {/* 侧面照 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              侧面照片 <span className="text-xs text-gray-400">（可选）</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">侧面照有助于更精准的穿搭匹配</p>
            <ImageUpload
              value={sidePhoto}
              onChange={setSidePhoto}
              className="aspect-[3/4] max-h-48"
            />
          </div>

          {/* 身体数据 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                身高 (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                体重 (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                年龄
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* 身材类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              身材类型
            </label>
            <div className="flex flex-wrap gap-2">
              {BODY_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  onClick={() => setBodyType(bodyType === bt.value ? '' : bt.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    bodyType === bt.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  )}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '创建中...' : '创建用户'}
          </button>
        </div>
      </div>
    </div>
  );
}
