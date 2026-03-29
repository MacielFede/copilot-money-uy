/**
 * Applies the Drizzle schema to SQLite (no migration history table yet).
 * Safe to call on every open — uses IF NOT EXISTS.
 */
export function applySchemaIfNeeded(db: { execSync: (sql: string) => void }): void {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS "settings" (
      "id" text PRIMARY KEY NOT NULL DEFAULT 'default',
      "currency" text DEFAULT 'USD',
      "budgeting_enabled" integer DEFAULT 1,
      "net_worth_timeframe" text DEFAULT '1M',
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "categories" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "emoji" text,
      "kind" text DEFAULT 'regular',
      "color" text,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "accounts" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "type" text NOT NULL,
      "balance" integer NOT NULL DEFAULT 0,
      "available" integer,
      "utilized_pct" real,
      "currency" text DEFAULT 'USD',
      "is_excluded_from_net_worth" integer DEFAULT 0,
      "institution" text,
      "mask" text,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "tags" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "color" text,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "transactions" (
      "id" text PRIMARY KEY NOT NULL,
      "date" integer NOT NULL,
      "name" text NOT NULL,
      "amount" integer NOT NULL,
      "currency" text DEFAULT 'USD',
      "account_id" text REFERENCES "accounts"("id"),
      "category_id" text REFERENCES "categories"("id"),
      "type" text DEFAULT 'regular',
      "is_excluded" integer DEFAULT 0,
      "is_recurring" integer DEFAULT 0,
      "tag_id" text,
      "goal_id" text,
      "needs_review" integer DEFAULT 0,
      "notes" text,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "budgets" (
      "id" text PRIMARY KEY NOT NULL,
      "month" text NOT NULL,
      "category_id" text REFERENCES "categories"("id"),
      "budget_amount" integer NOT NULL,
      "mode" text DEFAULT 'same_all_months',
      "is_excluded" integer DEFAULT 0,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "recurrings" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "emoji" text,
      "category_id" text REFERENCES "categories"("id"),
      "frequency" text NOT NULL,
      "expected_day_range" text,
      "amount_min" integer,
      "amount_max" integer,
      "next_payment_date" integer,
      "apply_to_transactions" text,
      "is_active" integer DEFAULT 1,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "savings_goals" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "emoji" text,
      "target_month" text,
      "target_amount" integer NOT NULL,
      "saved_amount" integer DEFAULT 0,
      "status" text DEFAULT 'active',
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "investments" (
      "id" text PRIMARY KEY NOT NULL,
      "group_name" text NOT NULL,
      "allocation_pct" real NOT NULL,
      "holdings_data" text,
      "display_mode" text DEFAULT 'pie',
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "cashflow_snapshots" (
      "id" text PRIMARY KEY NOT NULL,
      "month" text NOT NULL,
      "income" integer NOT NULL,
      "spend" integer NOT NULL,
      "excluded_spend" integer DEFAULT 0,
      "net_income" integer NOT NULL,
      "created_at" integer,
      "updated_at" integer
    );

    CREATE TABLE IF NOT EXISTS "balance_snapshots" (
      "id" text PRIMARY KEY NOT NULL,
      "account_id" text NOT NULL REFERENCES "accounts"("id"),
      "date" text NOT NULL,
      "balance_amount" integer NOT NULL
    );
  `);

  tryAddColumn(db, `ALTER TABLE "accounts" ADD COLUMN "color" text`);
  tryAddColumn(db, `ALTER TABLE "accounts" ADD COLUMN "credit_limit" integer`);
}

function tryAddColumn(db: { execSync: (sql: string) => void }, sql: string): void {
  try {
    db.execSync(sql);
  } catch {
    // Column already exists or other benign failure on older DBs
  }
}
