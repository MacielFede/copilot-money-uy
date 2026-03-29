import { cashflowSnapshots, db, type CashflowSnapshot } from "@/src/db/client";
import { desc, eq } from "drizzle-orm";

export interface CashflowData {
  month: string;
  income: number;
  spend: number;
  excludedSpend: number;
  netIncome: number;
  trend: number; // percentage change from previous month
}

export interface CashflowSummary {
  totalIncome: number;
  totalSpend: number;
  totalExcluded: number;
  totalNetIncome: number;
  averageMonthlyIncome: number;
  averageMonthlySpend: number;
}

// Get cashflow data for the last N months
export async function getCashflowHistory(
  months: number = 6
): Promise<CashflowData[]> {
  const result = await db
    .select()
    .from(cashflowSnapshots)
    .orderBy(desc(cashflowSnapshots.month))
    .limit(months);

  // Reverse to get chronological order
  const reversed = result.reverse();

  // Calculate trends
  return reversed.map((snapshot, index) => {
    const prevSnapshot = index > 0 ? reversed[index - 1] : null;
    let trend = 0;

    if (prevSnapshot && prevSnapshot.spend > 0) {
      trend =
        ((snapshot.spend - prevSnapshot.spend) / prevSnapshot.spend) * 100;
    }

    return {
      month: snapshot.month,
      income: snapshot.income,
      spend: snapshot.spend,
      excludedSpend: snapshot.excludedSpend ?? 0,
      netIncome: snapshot.netIncome,
      trend,
    };
  });
}

// Get cashflow summary
export async function getCashflowSummary(): Promise<CashflowSummary> {
  const result = await db
    .select()
    .from(cashflowSnapshots)
    .orderBy(desc(cashflowSnapshots.month))
    .limit(6);

  const totalIncome = result.reduce((sum, s) => sum + s.income, 0);
  const totalSpend = result.reduce((sum, s) => sum + s.spend, 0);
  const totalExcluded = result.reduce(
    (sum, s) => sum + (s.excludedSpend ?? 0),
    0
  );
  const totalNetIncome = result.reduce((sum, s) => sum + s.netIncome, 0);

  const count = result.length || 1;

  return {
    totalIncome,
    totalSpend,
    totalExcluded,
    totalNetIncome,
    averageMonthlyIncome: Math.round(totalIncome / count),
    averageMonthlySpend: Math.round(totalSpend / count),
  };
}

// Get current month's cashflow
export async function getCurrentMonthCashflow(): Promise<CashflowData | null> {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  const result = await db
    .select()
    .from(cashflowSnapshots)
    .where(eq(cashflowSnapshots.month, monthStr))
    .limit(1);

  if (result.length === 0) return null;

  const snapshot = result[0];
  return {
    month: snapshot.month,
    income: snapshot.income,
    spend: snapshot.spend,
    excludedSpend: snapshot.excludedSpend ?? 0,
    netIncome: snapshot.netIncome,
    trend: 0,
  };
}

// Add or update cashflow snapshot
export async function upsertCashflowSnapshot(
  month: string,
  data: Partial<
    Pick<CashflowSnapshot, "income" | "spend" | "excludedSpend" | "netIncome">
  >
): Promise<CashflowSnapshot> {
  const netIncome =
    (data.income ?? 0) - (data.spend ?? 0) - (data.excludedSpend ?? 0);

  const [updated] = await db
    .insert(cashflowSnapshots)
    .values({
      id: month,
      month,
      income: data.income ?? 0,
      spend: data.spend ?? 0,
      excludedSpend: data.excludedSpend ?? 0,
      netIncome,
    })
    .onConflictDoUpdate({
      target: cashflowSnapshots.month,
      set: {
        ...data,
        netIncome,
        updatedAt: new Date(),
      },
    })
    .returning();

  return updated;
}
