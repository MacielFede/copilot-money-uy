import { db, investments, type Investment } from "@/src/db/client";
import { desc, eq } from "drizzle-orm";

export interface InvestmentWithHoldings extends Investment {
  holdings: {
    symbol: string;
    name: string;
    value: number;
  }[];
  totalValue: number;
  allocationValue: number;
}

// Get all investments
export async function listInvestments(): Promise<Investment[]> {
  return db.select().from(investments).orderBy(desc(investments.allocationPct));
}

// Get investments with parsed holdings
export async function getInvestmentsWithHoldings(): Promise<
  InvestmentWithHoldings[]
> {
  const invs = await listInvestments();

  return invs.map((inv) => {
    let holdings: { symbol: string; name: string; value: number }[] = [];

    try {
      if (inv.holdingsData) {
        holdings = JSON.parse(inv.holdingsData);
      }
    } catch {
      holdings = [];
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const allocationValue = 0; // Would be calculated from account balances

    return {
      ...inv,
      holdings,
      totalValue,
      allocationValue,
    };
  });
}

// Get a single investment
export async function getInvestment(id: string): Promise<Investment | null> {
  const result = await db
    .select()
    .from(investments)
    .where(eq(investments.id, id))
    .limit(1);
  return result[0] ?? null;
}

// Get total investment value
export async function getTotalInvestmentValue(): Promise<number> {
  const invs = await getInvestmentsWithHoldings();
  return invs.reduce((sum, inv) => sum + inv.totalValue, 0);
}

// Get investment allocation breakdown
export async function getInvestmentAllocation(): Promise<
  {
    groupName: string;
    allocationPct: number;
    value: number;
  }[]
> {
  const invs = await getInvestmentsWithHoldings();
  const total = invs.reduce((sum, inv) => sum + inv.totalValue, 0);

  return invs.map((inv) => ({
    groupName: inv.groupName,
    allocationPct: inv.allocationPct,
    value: inv.totalValue,
  }));
}

// Update investment
export async function updateInvestment(
  id: string,
  data: Partial<
    Pick<
      Investment,
      "groupName" | "allocationPct" | "holdingsData" | "displayMode"
    >
  >
): Promise<Investment> {
  const [updated] = await db
    .update(investments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(investments.id, id))
    .returning();

  return updated;
}

// Create investment
export async function createInvestment(
  data: Omit<Investment, "id" | "createdAt" | "updatedAt">
): Promise<Investment> {
  const [created] = await db
    .insert(investments)
    .values({
      ...data,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
    .returning();

  return created;
}

// Delete investment
export async function deleteInvestment(id: string): Promise<void> {
  await db.delete(investments).where(eq(investments.id, id));
}

// Get investment groups for display
export type InvestmentDisplayFilter =
  | "all"
  | "stocks"
  | "bonds"
  | "etfs"
  | "crypto";

export async function getFilteredInvestments(
  filter: InvestmentDisplayFilter
): Promise<InvestmentWithHoldings[]> {
  const all = await getInvestmentsWithHoldings();

  // For now, just return all - would filter based on holdings
  return all;
}
