import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db';

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

    // 检查用户是否存在
    const existing = await getUserById(id);
    if (!existing) {
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

    // 构建更新数据
    const data: Record<string, unknown> = {};
    if (name !== null) data.name = name;
    if (gender !== null) data.gender = gender;
    if (heightStr) data.height = parseFloat(heightStr);
    if (weightStr) data.weight = parseFloat(weightStr);
    if (ageStr) data.age = parseInt(ageStr);
    if (bodyType !== null) data.bodyType = bodyType;
    if (frontPhoto !== null) data.frontPhoto = frontPhoto;
    if (sidePhoto !== null) data.sidePhoto = sidePhoto;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const result = await updateUser(id, data);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('PUT /api/users/[id] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
