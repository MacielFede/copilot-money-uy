import { accounts, balanceSnapshots, db, type Account } from "@/src/db/client";
import { asc, desc, eq } from "drizzle-orm";

export type { Account };

export type AccountWithBalance = Account & {
  // Computed fields
  displayBalance: string;
  displayAvailable?: string;
};

// Get all accounts
export async function listAccounts(): Promise<Account[]> {
  return db.select().from(accounts).orderBy(desc(accounts.balance));
}

type AccountGroupKey =
  | "credit_cards"
  | "depository"
  | "investment"
  | "loan"
  | "other";

function mapAccountTypeToGroup(type: string): AccountGroupKey {
  if (type === "credit_card") return "credit_cards";
  if (type === "depository") return "depository";
  if (type === "investment" || type === "manual_investment") return "investment";
  if (type === "loan") return "loan";
  return "other";
}

// Get accounts grouped by type
export async function getAccountsGroupedByType(): Promise<{
  credit_cards: Account[];
  depository: Account[];
  investment: Account[];
  loan: Account[];
  other: Account[];
}> {
  const allAccounts = await listAccounts();

  const grouped: Record<AccountGroupKey, Account[]> = {
    credit_cards: [],
    depository: [],
    investment: [],
    loan: [],
    other: [],
  };

  for (const account of allAccounts) {
    grouped[mapAccountTypeToGroup(account.type)].push(account);
  }

  return grouped;
}

export interface BalanceSnapshotDay {
  date: string;
  balancesByAccountId: Record<string, number>;
}

/** Reconstruct per-day balances from snapshot rows (sorted by date). */
export async function listBalanceSnapshotDays(): Promise<BalanceSnapshotDay[]> {
  const rows = await db
    .select()
    .from(balanceSnapshots)
    .orderBy(asc(balanceSnapshots.date));

  const byDate = new Map<string, Record<string, number>>();
  for (const row of rows) {
    if (!byDate.has(row.date)) byDate.set(row.date, {});
    byDate.get(row.date)![row.accountId] = row.balanceAmount;
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, balancesByAccountId]) => ({ date, balancesByAccountId }));
}

/** Net worth in cents at a snapshot day (uses stored balance per account, else live balance). */
export function netWorthForSnapshotDay(
  day: BalanceSnapshotDay,
  includedAccounts: Account[]
): number {
  let sum = 0;
  for (const a of includedAccounts) {
    const bal = day.balancesByAccountId[a.id] ?? a.balance;
    sum += bal;
  }
  return sum;
}

/** Approximate % change per account over the last up-to-30 snapshot days. */
export function computeAccountChangePercents(
  history: BalanceSnapshotDay[],
  accounts: Account[]
): Record<string, number> {
  const slice = history.slice(-30);
  const first = slice[0];
  const last = slice[slice.length - 1];
  const out: Record<string, number> = {};
  for (const a of accounts) {
    const startBal = first?.balancesByAccountId[a.id] ?? a.balance;
    const endBal = last?.balancesByAccountId[a.id] ?? a.balance;
    out[a.id] =
      startBal !== 0
        ? ((endBal - startBal) / Math.abs(startBal)) * 100
        : 0;
  }
  return out;
}

// Get a single account by ID
export async function getAccount(id: string): Promise<Account | null> {
  const result = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, id))
    .limit(1);
  return result[0] ?? null;
}

// Calculate total net worth (sum of all non-excluded accounts)
export async function getNetWorth(): Promise<number> {
  const allAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.isExcludedFromNetWorth, 0));

  return allAccounts.reduce((total, account) => total + account.balance, 0);
}

// Get accounts included in net worth
export async function getAccountsForNetWorth(): Promise<Account[]> {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.isExcludedFromNetWorth, 0))
    .orderBy(desc(accounts.balance));
}

// Update account
export async function updateAccount(
  id: string,
  data: Partial<
    Pick<
      Account,
      | "name"
      | "balance"
      | "available"
      | "isExcludedFromNetWorth"
      | "institution"
      | "mask"
    >
  >
): Promise<Account> {
  const [updated] = await db
    .update(accounts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(accounts.id, id))
    .returning();

  return updated;
}

// Create a new account
export async function createAccount(
  data: Omit<Account, "id" | "createdAt" | "updatedAt">
): Promise<Account> {
  const [created] = await db
    .insert(accounts)
    .values({
      ...data,
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
    .returning();

  return created;
}

// Delete an account
export async function deleteAccount(id: string): Promise<void> {
  await db.delete(accounts).where(eq(accounts.id, id));
}

// Get total balance by account type
export async function getBalanceByType(): Promise<
  {
    type: string;
    total: number;
  }[]
> {
  const allAccounts = await listAccounts();

  const byType = new Map<string, number>();

  for (const account of allAccounts) {
    const current = byType.get(account.type) ?? 0;
    byType.set(account.type, current + account.balance);
  }

  return Array.from(byType.entries()).map(([type, total]) => ({ type, total }));
}
