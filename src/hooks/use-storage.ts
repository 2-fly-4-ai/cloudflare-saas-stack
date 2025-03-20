import { useState } from "react";

interface UploadOptions {
  contentType?: string;
  onProgress?: (progress: number) => void;
}

interface ErrorResponse {
  error: string;
}

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  /**
   * Upload a file to the R2 storage
   */
  const uploadFile = async (
    file: File, 
    key?: string,
    options?: UploadOptions
  ) => {
    try {
      setIsUploading(true);
      
      // Generate a key if not provided
      const fileKey = key || `${Date.now()}-${file.name}`;
      
      // Create a URL-safe key with proper path encoding
      const safeKey = encodeURIComponent(fileKey);
      
      // Upload the file using the API
      const response = await fetch(`/api/storage/${safeKey}`, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || options?.contentType || "application/octet-stream",
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to upload file");
      }
      
      const result = await response.json();
      
      // Return the URL for the uploaded file
      return {
        key: fileKey,
        url: `/api/storage/${safeKey}`,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  /**
   * Delete a file from the R2 storage
   */
  const deleteFile = async (key: string) => {
    try {
      setIsDeleting(true);
      
      // Create a URL-safe key with proper path encoding
      const safeKey = encodeURIComponent(key);
      
      // Delete the file using the API
      const response = await fetch(`/api/storage/${safeKey}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Failed to delete file");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  /**
   * Get the URL for a file
   */
  const getFileUrl = (key: string) => {
    // Create a URL-safe key with proper path encoding
    const safeKey = encodeURIComponent(key);
    return `/api/storage/${safeKey}`;
  };
  
  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    isUploading,
    isDeleting,
  };
} 