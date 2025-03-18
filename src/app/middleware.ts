import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

// This middleware will run on the edge
export const config = {
  matcher: '/api/edge/:path*',
}

export function middleware(request: NextRequest) {
  // You can access Cloudflare bindings here if needed
  // Example (uncomment to use):
  // const ctx = getRequestContext()
  // const myKv = ctx.env.MY_KV_NAMESPACE
  
  // You can modify the response or add headers
  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  
  return response
} 