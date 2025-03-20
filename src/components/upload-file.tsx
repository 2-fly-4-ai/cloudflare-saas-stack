"use client";

import { useState, useRef } from "react";
import { useStorage } from "@/hooks/use-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

interface UploadFileProps {
  onUpload?: (fileData: { key: string; url: string }) => void;
  accept?: string;
  maxSize?: number;
}

export function UploadFile({
  onUpload,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
}: UploadFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile, isUploading } = useStorage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // Reset state
    setError(null);
    setSelectedFile(file);

    // Validate file
    if (file) {
      if (file.size > maxSize) {
        setError(
          `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`
        );
        setSelectedFile(null);
        return;
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      const result = await uploadFile(selectedFile);

      // Clear selected file after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call the onUpload callback with the result
      onUpload?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
          aria-hidden="true"
        />
        <Button type="button" onClick={handleButtonClick} variant="outline">
          Select File
        </Button>

        {selectedFile && (
          <div className="flex-1 flex gap-2 items-center">
            <span className="text-sm truncate flex-1">{selectedFile.name}</span>
            <Button onClick={handleUpload} disabled={isUploading} size="sm">
              {isUploading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
