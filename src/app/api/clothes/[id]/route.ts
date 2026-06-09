import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  return neon(url);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sql = getSql();

    const now = new Date().toISOString();

    await sql`
      UPDATE "ClothingItem"
      SET
        "name" = COALESCE(${body.name ?? null}, "name"),
        "category" = COALESCE(${body.category ?? null}, "category"),
        "subcategory" = COALESCE(${body.subcategory ?? null}, "subcategory"),
        "color" = COALESCE(${body.color ?? null}, "color"),
        "colors" = COALESCE(${body.colors ? JSON.stringify(body.colors) : null}, "colors"),
        "material" = COALESCE(${body.material ?? null}, "material"),
        "season" = COALESCE(${body.season ? JSON.stringify(body.season) : null}, "season"),
        "style" = COALESCE(${body.style ? JSON.stringify(body.style) : null}, "style"),
        "brand" = COALESCE(${body.brand ?? null}, "brand"),
        "isFavorite" = COALESCE(${body.isFavorite ?? null}, "isFavorite"),
        "notes" = COALESCE(${body.notes ?? null}, "notes"),
        "updatedAt" = ${now}
      WHERE "id" = ${id}
    `;

    const rows = await sql`SELECT * FROM "ClothingItem" WHERE "id" = ${id}`;
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('PUT /api/clothes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getSql();
    await sql`DELETE FROM "ClothingItem" WHERE "id" = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clothes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
