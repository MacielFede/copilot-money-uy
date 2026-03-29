import {
  accounts,
  categories,
  db,
  savingsGoals,
  tags,
  transactions,
  type Account,
  type Category,
  type SavingsGoal,
  type Tag,
  type Transaction,
} from "@/src/db/client";
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  like,
  lte,
  lt,
  or,
  type SQL,
} from "drizzle-orm";

export interface TransactionWithDetails extends Transaction {
  category?: Category | null;
  account?: Account | null;
}

/** Use with category multi-filter: transactions with null category match this sentinel. */
export const UNCATEGORIZED_CATEGORY_ID = "__uncategorized__";

export interface TransactionFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  /** Multi-select category filter (including `UNCATEGORIZED_CATEGORY_ID` for null category). */
  categoryIds?: string[];
  accountId?: string;
  needsReview?: boolean;
}

export interface TransactionCursor {
  date: Date;
  id: string;
}

export interface ListTransactionsPageParams extends TransactionFilters {
  cursor?: TransactionCursor | null;
  pageSize?: number;
}

export interface ListTransactionsPageResult {
  rows: TransactionWithDetails[];
  nextCursor: TransactionCursor | null;
}

export interface TransactionGroup {
  date: string;
  label: string;
  transactions: TransactionWithDetails[];
}

function buildCategoryFilter(ids: string[] | undefined): SQL | undefined {
  if (!ids || ids.length === 0) return undefined;
  const hasUncat = ids.includes(UNCATEGORIZED_CATEGORY_ID);
  const rest = ids.filter((id) => id !== UNCATEGORIZED_CATEGORY_ID);
  if (hasUncat && rest.length === 0) {
    return isNull(transactions.categoryId);
  }
  if (hasUncat && rest.length > 0) {
    return or(isNull(transactions.categoryId), inArray(transactions.categoryId, rest))!;
  }
  return inArray(transactions.categoryId, rest);
}

function buildTransactionFilterConditions(
  filters: TransactionFilters
): SQL[] {
  const conditions: SQL[] = [];

  if (filters.search) {
    conditions.push(like(transactions.name, `%${filters.search}%`));
  }

  if (filters.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }

  const categorySql = buildCategoryFilter(filters.categoryIds);
  if (categorySql) {
    conditions.push(categorySql);
  } else if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  if (filters.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }

  if (filters.needsReview !== undefined) {
    conditions.push(eq(transactions.needsReview, filters.needsReview ? 1 : 0));
  }

  return conditions;
}

function mapJoinedTransactionRow(row: {
  transactions: Transaction;
  categories: Category | null;
  accounts: Account | null;
}): TransactionWithDetails {
  return {
    ...row.transactions,
    category: row.categories ?? null,
    account: row.accounts ?? null,
  };
}

// Helper to format date for grouping
function formatGroupDate(date: Date): { date: string; label: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDate.getTime() === today.getTime()) {
    return { date: "today", label: "Today" };
  } else if (txDate.getTime() === yesterday.getTime()) {
    return { date: "yesterday", label: "Yesterday" };
  } else {
    return {
      date: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    };
  }
}

// List transactions with optional filters
export async function listTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionWithDetails[]> {
  const conditions = buildTransactionFilterConditions(filters);

  const result = await db
    .select()
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.id));

  return result.map(mapJoinedTransactionRow);
}

const DEFAULT_PAGE_SIZE = 40;

/** Cursor-paginated transactions (newest first). */
export async function listTransactionsPage(
  params: ListTransactionsPageParams = {}
): Promise<ListTransactionsPageResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const take = pageSize + 1;

  const filterConditions = buildTransactionFilterConditions(params);
  const cursor = params.cursor;

  const cursorCondition: SQL | undefined = cursor
    ? or(
        lt(transactions.date, cursor.date),
        and(eq(transactions.date, cursor.date), lt(transactions.id, cursor.id))
      )!
    : undefined;

  const allConditions = cursorCondition
    ? [...filterConditions, cursorCondition]
    : filterConditions;

  const result = await db
    .select()
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(allConditions.length > 0 ? and(...allConditions) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(take);

  const hasMore = result.length > pageSize;
  const slice = hasMore ? result.slice(0, pageSize) : result;
  const rows = slice.map(mapJoinedTransactionRow);

  const last = rows[rows.length - 1];
  const nextCursor: TransactionCursor | null =
    hasMore && last
      ? { date: last.date as Date, id: last.id }
      : null;

  return { rows, nextCursor };
}

/** Categories for filters (name order). */
export async function listCategoriesForTransactions(): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.name);
}

/** Tags for transaction form picker (name order). */
export async function listTagsForTransactions(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(tags.name);
}

/** Savings goals for transaction form picker (name order). */
export async function listSavingsGoalsForTransactions(): Promise<
  SavingsGoal[]
> {
  return db.select().from(savingsGoals).orderBy(savingsGoals.name);
}

/**
 * Per calendar month (device local timezone), total spending: sum of outflows
 * (negative `amount` as positive cents). Same filters as list transactions.
 * Keys are `YYYY-MM`, matching the transaction list month headers.
 *
 * Implemented in JS so month boundaries match `new Date(txn.date)` / `getMonth()` — SQLite
 * `strftime`/`unixepoch` can disagree with Drizzle’s timestamp encoding.
 */
export async function getMonthlySpendTotalsCents(
  filters: TransactionFilters = {}
): Promise<Record<string, number>> {
  const conditions = buildTransactionFilterConditions(filters);
  const rows = await db
    .select({ date: transactions.date, amount: transactions.amount })
    .from(transactions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const out: Record<string, number> = {};
  for (const row of rows) {
    const d = new Date(row.date);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (row.amount < 0) {
      out[mk] = (out[mk] ?? 0) - row.amount;
    }
  }
  return out;
}

// Get transactions grouped by date
export async function getTransactionsGrouped(
  filters: TransactionFilters = {}
): Promise<TransactionGroup[]> {
  const txns = await listTransactions(filters);

  const groups: Map<string, TransactionGroup> = new Map();

  for (const txn of txns) {
    const { date, label } = formatGroupDate(new Date(txn.date));

    if (!groups.has(date)) {
      groups.set(date, { date, label, transactions: [] });
    }

    groups.get(date)!.transactions.push(txn);
  }

  return Array.from(groups.values());
}

// Get a single transaction by ID
export async function getTransaction(
  id: string
): Promise<TransactionWithDetails | null> {
  const result = await db
    .select()
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(transactions.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    ...row.transactions,
    category: row.categories ?? null,
    account: row.accounts ?? null,
  };
}

// Update a transaction (all user-editable columns except id/timestamps)
export type TransactionUpdatePayload = Partial<
  Omit<Transaction, "id" | "createdAt" | "updatedAt">
>;

export async function updateTransaction(
  id: string,
  data: TransactionUpdatePayload
): Promise<Transaction> {
  const [updated] = await db
    .update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(transactions.id, id))
    .returning();

  return updated;
}

// Create a new transaction
export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
): Promise<Transaction> {
  const [created] = await db
    .insert(transactions)
    .values({
      ...data,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
    .returning();

  return created;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
}

// Bulk update transactions (for selection actions)
export async function bulkUpdateTransactions(
  ids: string[],
  data: Partial<Pick<Transaction, "categoryId" | "isExcluded" | "needsReview">>
): Promise<number> {
  const result = await db
    .update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(...ids.map((id) => eq(transactions.id, id))));

  return result.changes;
}

// Get transactions needing review
export async function getTransactionsNeedingReview(): Promise<
  TransactionWithDetails[]
> {
  return listTransactions({ needsReview: true });
}

// Get spending by category for a date range
export async function getSpendingByCategory(
  startDate: Date,
  endDate: Date
): Promise<{ categoryId: string; category: Category | null; total: number }[]> {
  const result = await db
    .select({
      categoryId: transactions.categoryId,
      total: transactions.amount,
      category: categories,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
        eq(transactions.type, "regular"),
        eq(transactions.isExcluded, 0)
      )
    )
    .orderBy(desc(transactions.amount));

  // Aggregate by category
  const aggregated = new Map<
    string,
    { categoryId: string; category: Category | null; total: number }
  >();

  for (const row of result) {
    const catId = row.categoryId ?? "uncategorized";
    const existing = aggregated.get(catId);

    if (existing) {
      existing.total += Math.abs(row.total); // Convert to positive for spending
    } else {
      aggregated.set(catId, {
        categoryId: catId,
        category: row.category ?? null,
        total: Math.abs(row.total),
      });
    }
  }

  return Array.from(aggregated.values());
}
