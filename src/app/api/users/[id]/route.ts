import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

async function saveFile(file: File, subdir: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${uuidv4()}.${ext}`;
  const dir = join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return `/uploads/avatars/${subdir}/${filename}`;
}

// 更新用户信息（含照片）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const gender = formData.get('gender') as string | null;
    const height = formData.get('height') ? parseFloat(formData.get('height') as string) : undefined;
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined;
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    const bodyType = formData.get('bodyType') as string | null;

    const frontPhotoFile = formData.get('frontPhoto') as File | null;
    const sidePhotoFile = formData.get('sidePhoto') as File | null;

    // 保存新照片（如果有的话）
    const frontPhotoUrl = frontPhotoFile
      ? await saveFile(frontPhotoFile, 'front')
      : undefined;
    const sidePhotoUrl = sidePhotoFile
      ? await saveFile(sidePhotoFile, 'side')
      : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== null && { name }),
        ...(gender !== null && { gender }),
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(age !== undefined && { age }),
        ...(bodyType !== null && { bodyType }),
        ...(frontPhotoUrl !== undefined && { frontPhoto: frontPhotoUrl }),
        ...(sidePhotoUrl !== undefined && { sidePhoto: sidePhotoUrl }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
