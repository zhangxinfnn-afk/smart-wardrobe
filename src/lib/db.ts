import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

// Neon SQL 客户端 - 使用 HTTP 连接，完美适配 serverless
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  return neon(url);
}

// === 用户相关 ===
export async function getUsers() {
  const sql = getSql();
  return sql`SELECT * FROM "User" ORDER BY "createdAt" DESC`;
}

export async function getUserById(id: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM "User" WHERE id = ${id}`;
  return rows[0] || null;
}

export async function createUser(data: {
  name: string;
  gender?: string | null;
  frontPhoto?: string | null;
  sidePhoto?: string | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  bodyType?: string | null;
}) {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = await sql`
    INSERT INTO "User" (id, name, gender, "frontPhoto", "sidePhoto", height, weight, age, "bodyType", "createdAt", "updatedAt")
    VALUES (${id}, ${data.name}, ${data.gender || null}, ${data.frontPhoto || null}, ${data.sidePhoto || null},
            ${data.height || null}, ${data.weight || null}, ${data.age || null}, ${data.bodyType || null},
            ${now}, ${now})
    RETURNING *
  `;
  return rows[0];
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const sql = getSql();
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      const col = `"${key}"`;
      sets.push(`${col} = $${i++}`);
      vals.push(value);
    }
  }

  if (sets.length === 0) return null;

  sets.push(`"updatedAt" = $${i++}`);
  vals.push(new Date().toISOString());
  vals.push(id);

  const query = `UPDATE "User" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`;
  const rows = await sql.query(query, vals);
  return rows[0];
}

// === 衣物相关 ===
export async function getClothes(userId: string, category?: string) {
  const sql = getSql();
  if (category && category !== 'ALL') {
    return sql`SELECT * FROM "ClothingItem" WHERE "userId" = ${userId} AND category = ${category} ORDER BY "createdAt" DESC`;
  }
  return sql`SELECT * FROM "ClothingItem" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`;
}

export async function createClothingItem(data: {
  userId: string;
  category: string;
  subcategory?: string | null;
  name: string;
  color?: string | null;
  colors?: string[];
  material?: string | null;
  season?: string[];
  style?: string[];
  brand?: string | null;
  imageUrl: string;
  notes?: string | null;
}) {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = await sql`
    INSERT INTO "ClothingItem" (id, "userId", category, subcategory, name, color, colors, material, season, style, brand, "imageUrl", notes, "createdAt", "updatedAt", "isFavorite")
    VALUES (${id}, ${data.userId}, ${data.category}, ${data.subcategory || null}, ${data.name},
            ${data.color || null}, ${JSON.stringify(data.colors || [])}, ${data.material || null},
            ${JSON.stringify(data.season || [])}, ${JSON.stringify(data.style || [])},
            ${data.brand || null}, ${data.imageUrl}, ${data.notes || null}, ${now}, ${now}, false)
    RETURNING *
  `;
  return rows[0];
}

export async function deleteClothingItem(id: string) {
  const sql = getSql();
  await sql`DELETE FROM "ClothingItem" WHERE id = ${id}`;
}

export async function updateClothingItem(id: string, data: Record<string, unknown>) {
  const sql = getSql();
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      // Prisma 列名和 JS 字段名一致（camelCase），直接使用
      const col = `"${key}"`;
      if (Array.isArray(value)) {
        sets.push(`${col} = $${i++}`);
        vals.push(JSON.stringify(value));
      } else {
        sets.push(`${col} = $${i++}`);
        vals.push(value);
      }
    }
  }

  sets.push(`"updatedAt" = $${i++}`);
  vals.push(new Date().toISOString());
  vals.push(id);

  const query = `UPDATE "ClothingItem" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`;
  const rows = await sql.query(query, vals);
  return rows[0];
}

// === 搭配相关 ===
export async function getOutfits(userId: string) {
  const sql = getSql();
  return sql`SELECT * FROM "Outfit" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`;
}

export async function createOutfit(data: {
  userId: string;
  name?: string | null;
  itemIds: string[];
  style: string;
  season: string;
  weatherType?: string | null;
  cityName?: string | null;
  temperature?: number | null;
  prompt?: string | null;
  outfitDesc?: string | null;
  generatedImage?: string | null;
  poseImages?: unknown[];
}) {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = await sql`
    INSERT INTO "Outfit" (id, "userId", name, "itemIds", style, season, "weatherType", "cityName", temperature, prompt, "outfitDesc", "generatedImage", "poseImages", "createdAt")
    VALUES (${id}, ${data.userId}, ${data.name || null}, ${JSON.stringify(data.itemIds)},
            ${data.style}, ${data.season}, ${data.weatherType || null}, ${data.cityName || null},
            ${data.temperature || null}, ${data.prompt || null}, ${data.outfitDesc || null},
            ${data.generatedImage || null}, ${JSON.stringify(data.poseImages || [])}, ${now})
    RETURNING *
  `;
  return rows[0];
}
