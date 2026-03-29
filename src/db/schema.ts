import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("default"),
  currency: text("currency").default("USD"),
  budgetingEnabled: integer("budgeting_enabled").default(1),
  netWorthTimeframe: text("net_worth_timeframe").default("1M"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji"),
  kind: text("kind", { enum: ["regular", "excluded"] }).default("regular"),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", {
    enum: [
      "credit_card",
      "depository",
      "investment",
      "loan",
      "manual_investment",
      "other",
    ],
  }).notNull(),
  balance: integer("balance").notNull().default(0), // cents
  available: integer("available"), // cents
  utilizedPct: real("utilized_pct"),
  currency: text("currency").default("USD"),
  isExcludedFromNetWorth: integer("is_excluded_from_net_worth").default(0),
  institution: text("institution"),
  mask: text("mask"),
  /** Card / institution accent for account row badge (hex). */
  color: text("color"),
  /** Credit limit in cents (credit cards). */
  creditLimit: integer("credit_limit"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

/** One row per account per calendar day; balances are cents. */
export const balanceSnapshots = sqliteTable("balance_snapshots", {
  id: text("id").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  date: text("date").notNull(),
  balanceAmount: integer("balance_amount").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(), // cents
  currency: text("currency").default("USD"),
  accountId: text("account_id").references(() => accounts.id),
  categoryId: text("category_id").references(() => categories.id),
  type: text("type", { enum: ["regular", "income", "transfer"] }).default(
    "regular"
  ),
  isExcluded: integer("is_excluded").default(0),
  isRecurring: integer("is_recurring").default(0),
  tagId: text("tag_id"),
  goalId: text("goal_id"),
  needsReview: integer("needs_review").default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const budgets = sqliteTable("budgets", {
  id: text("id").primaryKey(),
  month: text("month").notNull(), // YYYY-MM format
  categoryId: text("category_id").references(() => categories.id),
  budgetAmount: integer("budget_amount").notNull(), // cents
  mode: text("mode", { enum: ["same_all_months", "per_month"] }).default(
    "same_all_months"
  ),
  isExcluded: integer("is_excluded").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const recurrings = sqliteTable("recurrings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji"),
  categoryId: text("category_id").references(() => categories.id),
  frequency: text("frequency", {
    enum: ["daily", "weekly", "biweekly", "monthly", "annual"],
  }).notNull(),
  expectedDayRange: text("expected_day_range"),
  amountMin: integer("amount_min"),
  amountMax: integer("amount_max"),
  nextPaymentDate: integer("next_payment_date", { mode: "timestamp" }),
  applyToTransactions: text("apply_to_transactions"),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const savingsGoals = sqliteTable("savings_goals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji"),
  targetMonth: text("target_month"),
  targetAmount: integer("target_amount").notNull(),
  savedAmount: integer("saved_amount").default(0),
  status: text("status", {
    enum: ["active", "ready_to_spend", "archived"],
  }).default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const investments = sqliteTable("investments", {
  id: text("id").primaryKey(),
  groupName: text("group_name").notNull(),
  allocationPct: real("allocation_pct").notNull(),
  holdingsData: text("holdings_data"),
  displayMode: text("display_mode").default("pie"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const cashflowSnapshots = sqliteTable("cashflow_snapshots", {
  id: text("id").primaryKey(),
  month: text("month").notNull(),
  income: integer("income").notNull(),
  spend: integer("spend").notNull(),
  excludedSpend: integer("excluded_spend").default(0),
  netIncome: integer("net_income").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export type Settings = typeof settings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type BalanceSnapshot = typeof balanceSnapshots.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Recurring = typeof recurrings.$inferSelect;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type CashflowSnapshot = typeof cashflowSnapshots.$inferSelect;
export type Tag = typeof tags.$inferSelect;
