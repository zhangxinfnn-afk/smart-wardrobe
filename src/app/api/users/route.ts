import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/db';

export async function GET() {
  try {
    const users = await getUsers();
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

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const user = await createUser({
      name,
      gender: (formData.get('gender') as string) || null,
      height: formData.get('height') ? parseFloat(formData.get('height') as string) : null,
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
      age: formData.get('age') ? parseInt(formData.get('age') as string) : null,
      bodyType: (formData.get('bodyType') as string) || null,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
