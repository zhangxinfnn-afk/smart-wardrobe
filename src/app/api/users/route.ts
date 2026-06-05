import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

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
    const gender = formData.get('gender') as string | null;
    const avatarFile = formData.get('avatar') as File | null;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    let avatarUrl: string | null = null;

    if (avatarFile) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = avatarFile.name.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${ext}`;

      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(join(UPLOAD_DIR, filename), buffer);
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    const user = await prisma.user.create({
      data: {
        name,
        gender: gender || null,
        avatar: avatarUrl,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
