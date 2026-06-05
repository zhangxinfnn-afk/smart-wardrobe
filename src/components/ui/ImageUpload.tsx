'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: File | string | null;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  accept?: Record<string, string[]>;
}

export function ImageUpload({
  value,
  onChange,
  previewUrl,
  className,
  accept,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const displayUrl = preview || previewUrl || (typeof value === 'string' ? value : null);

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-xl cursor-pointer transition-colors',
        isDragActive
          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-purple-600 dark:hover:bg-gray-800',
        displayUrl ? 'p-0' : 'p-2',
        className
      )}
    >
      <input {...getInputProps()} />

      {displayUrl ? (
        <div className="relative h-full">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 h-full min-h-[80px]">
          {isDragActive ? (
            <>
              <Upload className="w-6 h-6 text-purple-500" />
              <p className="text-xs font-medium text-purple-600">释放上传</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              <p className="text-xs">点击或拖拽上传</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
