import Link from 'next/link';
import { Home, Shirt } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          页面未找到
        </h2>
        <p className="text-gray-500 mb-6">
          你要找的页面不存在或已被移除
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium no-underline"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <Link
            href="/closet"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium no-underline"
          >
            <Shirt className="w-4 h-4" />
            衣帽间
          </Link>
        </div>
      </div>
    </div>
  );
}
