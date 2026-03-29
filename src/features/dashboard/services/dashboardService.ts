import { getAccountsForNetWorth } from "@/features/accounts/services/accountsService";
import {
  budgets,
  cashflowSnapshots,
  categories,
  db,
  recurrings,
  transactions,
  type Category,
} from "@/src/db/client";
import { and, desc, eq, gte, lte, sum } from "drizzle-orm";

export interface DashboardSummary {
  // Net worth
  netWorth: number;
  netWorthChange: number; // Change from last period

  // This month's spending
  spentThisMonth: number;
  spentLastMonth: number;
  spendingTrend: number; // Percentage change

  // Income
  incomeThisMonth: number;
  incomeLastMonth: number;

  // Counts
  toReviewCount: number;
  upcomingRecurringsCount: number;
}

export interface ToReviewItem {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category?: Category | null;
}

export interface UpcomingRecurring {
  id: string;
  name: string;
  emoji?: string;
  amount: number;
  nextPaymentDate: Date;
  category?: Category | null;
}

export interface BudgetSummary {
  categoryId: string;
  category: Category | null;
  budgetAmount: number;
  spentAmount: number;
  remaining: number;
  percentUsed: number;
}

export interface CashflowSummary {
  month: string;
  income: number;
  spend: number;
  netIncome: number;
}

/** Cumulative spending (expenses only) for the spending vs last-month chart. */
export interface SpendingChartData {
  thisMonthTotalCents: number;
  lastMonthTotalCents: number;
  daysInMonth: number;
  /** 1-based day of month */
  todayDay: number;
  /** Cumulative cents after each day 1..todayDay (length === todayDay). */
  cumulativeCentsByDay: number[];
}

function expenseCents(amount: number): number {
  return amount < 0 ? Math.abs(amount) : 0;
}

export async function getSpendingChartData(): Promise<SpendingChartData> {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const todayDay = now.getDate();

  const monthStart = new Date(y, mo, 1, 0, 0, 0, 0);
  const monthEnd = new Date(y, mo + 1, 0, 23, 59, 59, 999);
  const lastMonthStart = new Date(y, mo - 1, 1, 0, 0, 0, 0);
  const lastMonthEnd = new Date(y, mo, 0, 23, 59, 59, 999);

  const thisRows = await db
    .select({ amount: transactions.amount, date: transactions.date })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd),
        eq(transactions.type, "regular"),
        eq(transactions.isExcluded, 0),
      ),
    );

  const lastRows = await db
    .select({ amount: transactions.amount })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, lastMonthStart),
        lte(transactions.date, lastMonthEnd),
        eq(transactions.type, "regular"),
        eq(transactions.isExcluded, 0),
      ),
    );

  const byDay: Record<number, number> = {};
  let thisMonthTotal = 0;
  for (const t of thisRows) {
    const add = expenseCents(t.amount);
    if (add === 0) continue;
    const day = new Date(t.date).getDate();
    byDay[day] = (byDay[day] ?? 0) + add;
    thisMonthTotal += add;
  }

  let lastMonthTotal = 0;
  for (const t of lastRows) {
    lastMonthTotal += expenseCents(t.amount);
  }

  const cumulativeCentsByDay: number[] = [];
  let cum = 0;
  for (let day = 1; day <= todayDay; day++) {
    cum += byDay[day] ?? 0;
    cumulativeCentsByDay.push(cum);
  }

  return {
    thisMonthTotalCents: thisMonthTotal,
    lastMonthTotalCents: lastMonthTotal,
    daysInMonth,
    todayDay,
    cumulativeCentsByDay,
  };
}

// Get date range for current month
function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

// Get date range for last month
function getLastMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return { start, end };
}

// Main dashboard summary
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const netWorth = await getAccountsForNetWorth().then((accounts) =>
    accounts.reduce((sum, acc) => sum + acc.balance, 0)
  );

  const { start: thisStart, end: thisEnd } = getCurrentMonthRange();
  const { start: lastStart, end: lastEnd } = getLastMonthRange();

  // Get spending this month (excluding income)
  const thisMonthSpending = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, thisStart),
        lte(transactions.date, thisEnd),
        eq(transactions.type, "regular"),
        eq(transactions.isExcluded, 0)
      )
    )
    .then((r) => Math.abs(Number(r[0]?.total ?? 0)));

  // Get spending last month
  const lastMonthSpending = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, lastStart),
        lte(transactions.date, lastEnd),
        eq(transactions.type, "regular"),
        eq(transactions.isExcluded, 0)
      )
    )
    .then((r) => Math.abs(Number(r[0]?.total ?? 0)));

  // Get income this month
  const incomeThisMonth = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, thisStart),
        lte(transactions.date, thisEnd),
        eq(transactions.type, "income")
      )
    )
    .then((r) => Number(r[0]?.total ?? 0));

  // Get income last month
  const incomeLastMonth = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, lastStart),
        lte(transactions.date, lastEnd),
        eq(transactions.type, "income")
      )
    )
    .then((r) => Number(r[0]?.total ?? 0));

  // Get counts
  const toReviewCount = await db
    .select({ count: transactions.id })
    .from(transactions)
    .where(eq(transactions.needsReview, 1))
    .then((r) => r.length);

  const upcomingRecurringsCount = await db
    .select({ count: recurrings.id })
    .from(recurrings)
    .where(eq(recurrings.isActive, 1))
    .then((r) => r.length);

  // Calculate trend
  const spendingTrend =
    lastMonthSpending > 0
      ? ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
      : 0;

  return {
    netWorth,
    netWorthChange: 0, // TODO: Calculate from cashflow snapshots
    spentThisMonth: thisMonthSpending,
    spentLastMonth: lastMonthSpending,
    spendingTrend,
    incomeThisMonth,
    incomeLastMonth,
    toReviewCount,
    upcomingRecurringsCount,
  };
}

const TO_REVIEW_PREVIEW_LIMIT = 50;

// Get transactions needing review
export async function getToReviewTransactions(): Promise<ToReviewItem[]> {
  const result = await db
    .select()
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.needsReview, 1))
    .orderBy(desc(transactions.date))
    .limit(TO_REVIEW_PREVIEW_LIMIT);

  return result.map((row) => ({
    id: row.transactions.id,
    name: row.transactions.name,
    amount: row.transactions.amount,
    date: row.transactions.date,
    category: row.categories ?? null,
  }));
}

/** Clear review flag for all transactions on a calendar day (local date from `YYYY-MM-DD`). */
export async function markTransactionsReviewedForDate(
  dateKey: string,
): Promise<void> {
  const [y, m, d] = dateKey.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  await db
    .update(transactions)
    .set({ needsReview: 0, updatedAt: new Date() })
    .where(
      and(
        eq(transactions.needsReview, 1),
        gte(transactions.date, start),
        lte(transactions.date, end),
      ),
    );
}

// Get upcoming recurring payments
export async function getUpcomingRecurrings(): Promise<UpcomingRecurring[]> {
  const result = await db
    .select()
    .from(recurrings)
    .leftJoin(categories, eq(recurrings.categoryId, categories.id))
    .where(eq(recurrings.isActive, 1))
    .orderBy(recurrings.nextPaymentDate);

  return result.map((row) => ({
    id: row.recurrings.id,
    name: row.recurrings.name,
    emoji: row.recurrings.emoji ?? undefined,
    amount: row.recurrings.amountMin ?? 0,
    nextPaymentDate: row.recurrings.nextPaymentDate!,
    category: row.categories ?? null,
  }));
}

// Get budget summaries for current month
export async function getBudgetSummaries(): Promise<BudgetSummary[]> {
  const { start, end } = getCurrentMonthRange();
  const monthStr = `${start.getFullYear()}-${String(
    start.getMonth() + 1
  ).padStart(2, "0")}`;

  // Get budgets for current month
  const monthBudgets = await db
    .select()
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.month, monthStr));

  // Get spending per category for this month
  const spending = await db
    .select({
      categoryId: transactions.categoryId,
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, start),
        lte(transactions.date, end),
        eq(transactions.type, "regular"),
        eq(transactions.isExcluded, 0)
      )
    )
    .groupBy(transactions.categoryId);

  const spendingMap = new Map(
    spending.map((s) => [s.categoryId, Math.abs(Number(s.total ?? 0))])
  );

  return monthBudgets.map((b) => {
    const spent = spendingMap.get(b.budgets.categoryId ?? "") ?? 0;
    const remaining = b.budgets.budgetAmount - spent;
    const percentUsed =
      b.budgets.budgetAmount > 0 ? (spent / b.budgets.budgetAmount) * 100 : 0;

    return {
      categoryId: b.budgets.categoryId ?? "",
      category: b.categories ?? null,
      budgetAmount: b.budgets.budgetAmount,
      spentAmount: spent,
      remaining,
      percentUsed,
    };
  });
}

// Get cashflow summary (last 6 months)
export async function getCashflowHistory(): Promise<CashflowSummary[]> {
  const result = await db
    .select()
    .from(cashflowSnapshots)
    .orderBy(desc(cashflowSnapshots.month))
    .limit(6);

  return result
    .map((row) => ({
      month: row.month,
      income: row.income,
      spend: row.spend,
      netIncome: row.netIncome,
    }))
    .reverse();
}
