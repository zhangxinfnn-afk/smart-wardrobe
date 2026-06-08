import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db';

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
    const data: Record<string, unknown> = {};

    const name = formData.get('name') as string | null;
    if (name !== null) data.name = name;

    const gender = formData.get('gender') as string | null;
    if (gender !== null) data.gender = gender;

    const height = formData.get('height');
    if (height) data.height = parseFloat(height as string);

    const weight = formData.get('weight');
    if (weight) data.weight = parseFloat(weight as string);

    const age = formData.get('age');
    if (age) data.age = parseInt(age as string);

    const bodyType = formData.get('bodyType') as string | null;
    if (bodyType !== null) data.bodyType = bodyType;

    const user = await updateUser(id, data);
    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
