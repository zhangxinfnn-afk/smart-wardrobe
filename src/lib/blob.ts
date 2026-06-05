import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Local filesystem storage for development
// Replace with @vercel/blob for production deployment

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

export async function uploadImage(
  file: File,
  folder: string = 'clothes'
): Promise<string> {
  await ensureUploadDir();

  // In production, use Vercel Blob:
  // import { put } from '@vercel/blob';
  // const blob = await put(`${folder}/${uuidv4()}-${file.name}`, file, { access: 'public' });
  // return blob.url;

  // For local development: save to public/uploads
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${folder}/${uuidv4()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  await mkdir(join(UPLOAD_DIR, folder), { recursive: true });
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function uploadMultipleImages(
  files: File[],
  folder: string = 'clothes'
): Promise<{ file: File; url: string }[]> {
  const results = await Promise.all(
    files.map(async (file) => ({
      file,
      url: await uploadImage(file, folder),
    }))
  );
  return results;
}
