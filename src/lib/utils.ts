import { type ClassValue, clsx } from 'clsx';

// Simple cn utility without tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
