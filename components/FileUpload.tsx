"use client";
import { useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Uploaded file: ${file.name}`);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept=".csv,.json,.txt,.pdf,.doc,.docx"
          disabled={isUploading}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              {isUploading ? 'Uploading...' : 'Click to upload'}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              or drag and drop
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            CSV, JSON, TXT, PDF, DOC up to 10MB
          </p>
        </label>
      </div>
      
      {isUploading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            Processing file and generating AI tags...
          </div>
        </div>
      )}
    </div>
  );
} 