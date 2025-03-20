import { env } from "@/env.mjs";
import { type R2Bucket } from "@cloudflare/workers-types";

/**
 * Utility functions for interacting with Cloudflare R2 bucket
 */

type StorageValue = string | ArrayBuffer | Uint8Array;

/**
 * Upload a file to the R2 bucket
 */
export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  value: StorageValue,
  contentType?: string,
  metadata?: Record<string, string>
) {
  const options: {
    httpMetadata?: { contentType?: string };
    customMetadata?: Record<string, string>;
  } = {};
  
  if (contentType) {
    options.httpMetadata = { contentType };
  }
  
  if (metadata) {
    options.customMetadata = metadata;
  }

  await bucket.put(key, value, options);
  
  // Return the public URL for the file
  return getFileUrl(key);
}

/**
 * Get a file from the R2 bucket
 */
export async function getFile(bucket: R2Bucket, key: string) {
  return await bucket.get(key);
}

/**
 * Delete a file from the R2 bucket
 */
export async function deleteFile(bucket: R2Bucket, key: string) {
  await bucket.delete(key);
}

/**
 * List files in the R2 bucket
 */
export async function listFiles(
  bucket: R2Bucket,
  options?: { prefix?: string; limit?: number; cursor?: string }
) {
  return await bucket.list(options);
}

/**
 * Get a public URL for a file
 */
export function getFileUrl(key: string) {
  // Make sure the key is URL safe
  const safeKey = encodeURIComponent(key);
  // You'd typically use a custom domain or Cloudflare Public R2 URLs
  // For now, we'll use a relative URL to the API route we'll create
  return `/api/storage/${safeKey}`;
} 