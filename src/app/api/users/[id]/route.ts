import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  return neon(url);
}

// 文件转 base64
async function fileToBase64(file: File | null): Promise<string | undefined> {
  if (!file) return undefined;
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const sql = getSql();

    const name = (formData.get('name') as string) || undefined;
    const gender = (formData.get('gender') as string) || undefined;
    const height = formData.get('height') ? parseFloat(formData.get('height') as string) : undefined;
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined;
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    const bodyType = (formData.get('bodyType') as string) || undefined;

    // 照片转 base64
    const frontPhotoFile = formData.get('frontPhoto') as File | null;
    const sidePhotoFile = formData.get('sidePhoto') as File | null;
    const frontPhoto = await fileToBase64(frontPhotoFile);
    const sidePhoto = await fileToBase64(sidePhotoFile);

    const now = new Date().toISOString();

    // 直接 SQL 更新，避免 db.ts 中字段名映射问题
    await sql`
      UPDATE "User"
      SET
        "name" = COALESCE(${name}, "name"),
        "gender" = COALESCE(${gender}, "gender"),
        "height" = COALESCE(${height}, "height"),
        "weight" = COALESCE(${weight}, "weight"),
        "age" = COALESCE(${age}, "age"),
        "bodyType" = COALESCE(${bodyType}, "bodyType"),
        "frontPhoto" = COALESCE(${frontPhoto}, "frontPhoto"),
        "sidePhoto" = COALESCE(${sidePhoto}, "sidePhoto"),
        "updatedAt" = ${now}
      WHERE "id" = ${id}
    `;

    // 返回更新后的用户
    const rows = await sql`SELECT * FROM "User" WHERE "id" = ${id}`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
