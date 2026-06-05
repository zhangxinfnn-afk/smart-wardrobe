'use client';

import { ChevronDown } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

export function ProfileSwitcher() {
  const { currentUser, users, setCurrentUser } = useAppStore();

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">穿搭对象</span>
      <div className="relative">
        <select
          value={currentUser?.id || ''}
          onChange={(e) => {
            const user = users.find((u) => u.id === e.target.value);
            if (user) setCurrentUser(user);
          }}
          className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors outline-none focus:ring-2 focus:ring-purple-500"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
