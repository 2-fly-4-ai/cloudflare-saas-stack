import { NextResponse } from "next/server";
import type { R2Bucket } from "@cloudflare/workers-types";

// The binding is defined in wrangler.toml
// This type helper allows us to access Cloudflare bindings
declare global {
  interface Env {
    BUCKET: R2Bucket;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    // Get the file key from the URL parameters
    const key = decodeURIComponent(params.key);
    
    // Access the R2 bucket binding directly from the environment
    // This works in Cloudflare Pages/Workers environment
    const env = request.cf?.env as Env | undefined;
    const bucket = env?.BUCKET;
    
    if (!bucket) {
      return NextResponse.json(
        { error: "Storage is not configured" },
        { status: 500 }
      );
    }
    
    // Get the file from R2
    const file = await bucket.get(key);
    
    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    // Create a response with the file data
    const headers = new Headers();
    if (file.httpMetadata?.contentType) {
      headers.set("Content-Type", file.httpMetadata.contentType);
    }
    
    // If the file has a URL-friendly name, suggest it for download
    if (file.key) {
      headers.set(
        "Content-Disposition",
        `inline; filename="${file.key.split("/").pop()}"`
      );
    }
    
    // Convert the R2 object body to a Web API compatible format
    // We need to handle the body differently in the browser vs worker environments
    let responseBody: BodyInit;
    
    // Try to get the file as an ArrayBuffer
    try {
      const arrayBuffer = await file.arrayBuffer();
      responseBody = arrayBuffer;
    } catch (error) {
      // If that fails, try to use the body stream directly
      // @ts-expect-error - Type mismatch between Cloudflare's ReadableStream and standard Web API's
      responseBody = file.body;
    }
    
    return new Response(responseBody, {
      headers,
    });
  } catch (error) {
    console.error("Error serving file from R2:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}

// You can also implement PUT, DELETE, etc. here
// For example:

export async function PUT(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key);
    
    // Access the R2 bucket binding
    const env = request.cf?.env as Env | undefined;
    const bucket = env?.BUCKET;
    
    if (!bucket) {
      return NextResponse.json(
        { error: "Storage is not configured" },
        { status: 500 }
      );
    }
    
    // Get content type from header
    const contentType = request.headers.get("Content-Type") || undefined;
    
    // Get the file data from the request
    const data = await request.arrayBuffer();
    
    // Upload to R2
    await bucket.put(key, data, {
      httpMetadata: contentType ? { contentType } : undefined,
    });
    
    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key);
    
    // Access the R2 bucket binding
    const env = request.cf?.env as Env | undefined;
    const bucket = env?.BUCKET;
    
    if (!bucket) {
      return NextResponse.json(
        { error: "Storage is not configured" },
        { status: 500 }
      );
    }
    
    // Delete from R2
    await bucket.delete(key);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file from R2:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
} 