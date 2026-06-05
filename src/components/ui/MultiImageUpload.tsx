'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export function MultiImageUpload({
  files,
  onFilesChange,
  maxFiles = 20,
  className,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<Record<number, string>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxFiles - files.length;
      const newFiles = acceptedFiles.slice(0, remaining);

      newFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviews((prev) => ({
            ...prev,
            [files.length + i]: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      });

      onFilesChange([...files, ...newFiles]);
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: maxFiles - files.length,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews: Record<number, string> = {};
    Object.entries(previews).forEach(([key, val]) => {
      const k = parseInt(key);
      if (k < index) newPreviews[k] = val;
      else if (k > index) newPreviews[k - 1] = val;
    });
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  return (
    <div className={className}>
      {/* Drop zone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors mb-4',
            isDragActive
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-purple-600'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">
              {isDragActive ? '释放文件以上传' : '批量上传照片'}
            </p>
            <p className="text-xs">
              拖拽或点击选择多张图片（还可上传 {maxFiles - files.length} 张）
            </p>
          </div>
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              已选择 {files.length} 张图片
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={previews[index] || URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
