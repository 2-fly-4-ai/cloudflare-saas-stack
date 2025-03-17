import { drizzle } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client?: D1Database;
};

export let client: D1Database | undefined;

// Create a db function that doesn't immediately call getRequestContext
export const db = () => {
  // Lazy initialization of the database client
  if (!client) {
    try {
      const context = getRequestContext();
      client = context.env.DATABASE;
      
      if (process.env.NODE_ENV !== "production") {
        globalForDb.client = client;
      }
    } catch (error) {
      // During build time, return a mock database that won't be used
      if (process.env.NODE_ENV === "production") {
        console.error("Failed to get request context. This is expected during build time.");
      }
    }
  }
  
  // If we still don't have a client, create a mock for build time
  if (!client) {
    // This is a temporary mock that will be replaced at runtime
    // It's only used to satisfy TypeScript during build
    return drizzle({} as D1Database, { schema });
  }
  
  return drizzle(client, { schema });
};
  