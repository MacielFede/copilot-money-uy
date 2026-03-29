import { drizzle } from "drizzle-orm/expo-sqlite";
import * as expoSQLite from "expo-sqlite";
import { applySchemaIfNeeded } from "./migrate";
import * as schema from "./schema";
export * from "./schema";

const DB_NAME = "copilotmoney.db";

// Singleton database instance
let drizzleDb: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!drizzleDb) {
    const expoDb = expoSQLite.openDatabaseSync(DB_NAME);
    applySchemaIfNeeded(expoDb);
    drizzleDb = drizzle(expoDb, { schema });
  }
  return drizzleDb;
}

/** Shared Drizzle instance (initialized on first import). */
export const db = getDatabase();

// Helper to check if database is initialized
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.select().from(schema.settings).limit(1);
    return true;
  } catch {
    return false;
  }
}
