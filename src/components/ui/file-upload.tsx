'use client';

import { useRef, useState } from 'react';

import { useMutation } from 'convex/react';
import { AlertCircle, FileText, Upload, X } from 'lucide-react';

import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Button } from './button';
import { Card, CardContent } from './card';

type UploadedFile = {
  storageId: Id<'_storage'>;
  fileName: string;
  fileSize: number;
  fileType: string;
};

type FileUploadProps = {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
};

export function FileUpload({
  onFilesUploaded,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 16,
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.cases.generateUploadUrl);

  const handleFiles = async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);

    // Validate files
    const validFiles = fileArray.filter((file) => {
      if (file.size > maxFileSize * 1024 * 1024) {
        onUploadError?.(
          `File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`
        );
        return false;
      }

      if (!acceptedTypes.includes(file.type)) {
        onUploadError?.(`File ${file.name} has an unsupported format.`);
        return false;
      }

      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      onUploadError?.(`Cannot upload more than ${maxFiles} files.`);
      return;
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const newUploadedFiles: UploadedFile[] = [];

      for (const file of validFiles) {
        try {
          // Get upload URL from Convex
          const uploadUrl = await generateUploadUrl();

          // Upload file to Convex storage
          const result = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          if (!result.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          const { storageId } = await result.json();

          newUploadedFiles.push({
            storageId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          onUploadError?.(`Failed to upload ${file.name}`);
        }
      }

      const allUploadedFiles = [...uploadedFiles, ...newUploadedFiles];
      setUploadedFiles(allUploadedFiles);
      onFilesUploaded(allUploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  return (
    <div className='space-y-4'>
      <Card
        className={`transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 border-dashed'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50 cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className='p-8'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-full'>
              {isUploading ? (
                <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
              ) : (
                <Upload className='text-muted-foreground h-6 w-6' />
              )}
            </div>

            <div>
              <p className='text-lg font-medium'>
                {isUploading ? 'Uploading...' : 'Choose files or drag and drop'}
              </p>
              <p className='text-muted-foreground text-sm'>
                PDF, Word, or Image files up to {maxFileSize}MB each
              </p>
              <p className='text-muted-foreground mt-1 text-xs'>
                Maximum {maxFiles} files
              </p>
            </div>

            <Button
              type='button'
              variant='outline'
              disabled={disabled || isUploading}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className='hidden'
        disabled={disabled}
      />

      {uploadedFiles.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium'>
            Uploaded Files ({uploadedFiles.length})
          </p>
          <div className='space-y-2'>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className='bg-muted/20 flex items-center justify-between rounded-md border p-3'
              >
                <div className='flex items-center space-x-3'>
                  <FileText className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium'>
                      {file.fileName}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {formatFileSize(file.fileSize)} MB
                    </p>
                  </div>
                </div>

                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className='h-8 w-8 flex-shrink-0 p-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
