import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

// 保存上传的文件，返回 URL
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

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const gender = (formData.get('gender') as string) || null;
    const height = formData.get('height') ? parseFloat(formData.get('height') as string) : null;
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null;
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : null;
    const bodyType = (formData.get('bodyType') as string) || null;

    // 照片文件
    const frontPhotoFile = formData.get('frontPhoto') as File | null;
    const sidePhotoFile = formData.get('sidePhoto') as File | null;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // 保存照片
    const frontPhotoUrl = frontPhotoFile ? await saveFile(frontPhotoFile, 'front') : null;
    const sidePhotoUrl = sidePhotoFile ? await saveFile(sidePhotoFile, 'side') : null;

    const user = await prisma.user.create({
      data: {
        name,
        gender,
        frontPhoto: frontPhotoUrl,
        sidePhoto: sidePhotoUrl,
        height,
        weight,
        age,
        bodyType,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
