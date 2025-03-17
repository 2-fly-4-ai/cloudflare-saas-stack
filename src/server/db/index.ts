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

export const db = () => {
  /**
   * Don't call getRequestContext() at the top level
   */
  const context = getRequestContext();
  client = globalForDb.client ?? context.env.DATABASE;
  
  if (process.env.NODE_ENV !== "production") {
    globalForDb.client = client;
  }
  
  if (!client) {
    throw new Error("D1 Database not available in environment");
  }
  
  return drizzle(client, { schema });
};
  