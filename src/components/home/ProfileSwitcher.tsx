'use client';

import { useState } from 'react';
import { UserPlus, User } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

export function ProfileSwitcher() {
  const { currentUser, users, setCurrentUser, addUser } = useAppStore();
  const [showNewUser, setShowNewUser] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreateUser = async () => {
    if (!newName.trim()) return;

    const formData = new FormData();
    formData.append('name', newName.trim());

    const res = await fetch('/api/users', { method: 'POST', body: formData });
    if (res.ok) {
      const user = await res.json();
      addUser(user);
      setCurrentUser(user);
      setNewName('');
      setShowNewUser(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-500">还没有用户，</div>
        <button
          onClick={() => setShowNewUser(true)}
          className="text-sm text-purple-600 font-medium hover:text-purple-700"
        >
          创建一个
        </button>
        {showNewUser && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名称"
              className="w-24 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
            />
            <button
              onClick={handleCreateUser}
              className="px-2 py-1 text-sm bg-purple-600 text-white rounded"
            >
              确定
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">穿搭对象：</span>
      <div className="flex items-center gap-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setCurrentUser(user)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
              currentUser.id === user.id
                ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300 shadow-sm'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            )}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {user.name}
          </button>
        ))}

        {/* Add user button */}
        {!showNewUser ? (
          <button
            onClick={() => setShowNewUser(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:text-purple-500 hover:border-purple-300 text-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名称"
              className="w-24 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
            />
            <button
              onClick={handleCreateUser}
              className="px-2 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              添加
            </button>
            <button
              onClick={() => setShowNewUser(false)}
              className="px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
