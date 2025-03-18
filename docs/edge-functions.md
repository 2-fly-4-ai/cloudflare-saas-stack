# Working with Edge Functions in Cloudflare + OpenNext

This document explains how to properly use edge functions in this project with Cloudflare and OpenNext.

## Edge vs. Node.js Runtime

When using OpenNext with Cloudflare, there are two different runtimes available:

1. **Node.js Runtime** - The default runtime for API routes
2. **Edge Runtime** - For high-performance, low-latency functions that can use Cloudflare bindings

## Guidelines for Edge Functions

OpenNext has specific requirements for edge functions:

1. Edge functions should be placed in dedicated files or routes
2. Always explicitly declare the edge runtime with `export const runtime = 'edge'`
3. Edge functions must be in their own routes, not mixed with Node.js functions

## Accessing Cloudflare Bindings

To access Cloudflare bindings (like KV, D1, R2, etc.), use the `getRequestContext` function:

```typescript
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET(request: NextRequest) {
  const ctx = getRequestContext();

  // Access KV
  const myKv = ctx.env.MY_KV_NAMESPACE;

  // Access D1 database
  const db = ctx.env.DATABASE;

  // Access Cloudflare request data
  const colo = ctx.cf?.colo;
}
```

## Project Structure

- Regular API routes: `/app/api/*`
- Edge API routes: `/app/api/edge/*`
- Middleware: `/app/middleware.ts` (also runs on the edge)

## Adding New Cloudflare Bindings

To add new bindings, update your `wrangler.toml` file:

```toml
# KV Namespace example
[[kv_namespaces]]
binding = "MY_KV_NAMESPACE"
id = "your-kv-namespace-id"

# R2 Bucket example
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"

# AI Binding example
[[ai]]
binding = "AI"
```

After updating your `wrangler.toml`, run:

```bash
npm run cf-typegen
```

This generates TypeScript types for your bindings.
