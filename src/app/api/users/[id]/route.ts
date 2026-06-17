import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  return neon(url);
}

async function fileToBase64(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mime = file.type || 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getSql();

    // 检查用户是否存在
    const existing = await sql`SELECT id FROM "User" WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();

    // 读取文本字段
    const name = formData.get('name') as string | null;
    const gender = formData.get('gender') as string | null;
    const heightStr = formData.get('height') as string | null;
    const weightStr = formData.get('weight') as string | null;
    const ageStr = formData.get('age') as string | null;
    const bodyType = formData.get('bodyType') as string | null;

    // 读取照片文件
    const frontPhoto = await fileToBase64(formData.get('frontPhoto') as File | null);
    const sidePhoto = await fileToBase64(formData.get('sidePhoto') as File | null);

    // 构建动态 UPDATE
    const updates: string[] = [];
    const vals: (string | number | null)[] = [];
    let i = 1;

    if (name !== null) { updates.push(`"name" = $${i++}`); vals.push(name); }
    if (gender !== null) { updates.push(`"gender" = $${i++}`); vals.push(gender); }
    if (heightStr) { updates.push(`"height" = $${i++}`); vals.push(parseFloat(heightStr)); }
    if (weightStr) { updates.push(`"weight" = $${i++}`); vals.push(parseFloat(weightStr)); }
    if (ageStr) { updates.push(`"age" = $${i++}`); vals.push(parseInt(ageStr)); }
    if (bodyType !== null) { updates.push(`"bodyType" = $${i++}`); vals.push(bodyType); }
    if (frontPhoto !== null) { updates.push(`"frontPhoto" = $${i++}`); vals.push(frontPhoto); }
    if (sidePhoto !== null) { updates.push(`"sidePhoto" = $${i++}`); vals.push(sidePhoto); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`"updatedAt" = NOW()`);
    vals.push(id);

    const query = `UPDATE "User" SET ${updates.join(', ')} WHERE "id" = $${i} RETURNING *`;

    // 使用 neon sql 执行
    const result = await sql(query, ...vals);
    return NextResponse.json(result[0]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('PUT /api/users/[id] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
