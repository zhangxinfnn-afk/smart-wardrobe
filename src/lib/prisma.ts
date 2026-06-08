import { PrismaClient } from '@prisma/client';

// 运行时才初始化的懒加载 Prisma 客户端
// 避免构建时加载 Node.js 原生模块（ws）
let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('[Prisma] DATABASE_URL not set');
    prismaInstance = new PrismaClient();
    return prismaInstance;
  }

  try {
    // 使用 Neon serverless 驱动（WebSocket 连接）
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');

    neonConfig.webSocketConstructor = require('ws');

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);

    prismaInstance = new PrismaClient({ adapter });
  } catch {
    // 降级：标准 TCP 连接
    console.warn('[Prisma] Falling back to standard connection');
    prismaInstance = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
  }

  return prismaInstance;
}

// 使用 Proxy 延迟初始化，避免构建时执行
const prismaHandler: ProxyHandler<object> = {
  get(_, prop: string | symbol) {
    const client = getPrismaClient();
    const value = (client as Record<string | symbol, unknown>)[prop];
    // 如果是函数，bind 到 client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
};

export const prisma = new Proxy({}, prismaHandler) as unknown as PrismaClient;
