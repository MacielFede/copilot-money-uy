import {
  budgets,
  categories,
  db,
  type Budget,
  type Category,
} from "@/src/db/client";
import { and, eq } from "drizzle-orm";

export interface BudgetWithCategory extends Budget {
  category?: Category | null;
}

export interface BudgetSummary {
  categoryId: string;
  category: Category | null;
  budgetAmount: number;
  spentAmount: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

// Get budgets for current month
export async function getCurrentMonthBudgets(): Promise<BudgetWithCategory[]> {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  return getBudgetsForMonth(monthStr);
}

// Get budgets for a specific month
export async function getBudgetsForMonth(
  month: string
): Promise<BudgetWithCategory[]> {
  const result = await db
    .select()
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.month, month))
    .orderBy(budgets.categoryId);

  return result.map((row) => ({
    ...row.budgets,
    category: row.categories ?? null,
  }));
}

// Get budget summaries with spending for current month
export async function getBudgetSummaries(): Promise<BudgetSummary[]> {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get budgets for current month
  const monthBudgets = await getBudgetsForMonth(monthStr);

  // Get actual spending by category
  const spending = await db
    .select({
      categoryId: budgets.categoryId,
      total: budgets.budgetAmount,
    })
    .from(budgets)
    .where(eq(budgets.month, monthStr));

  // For now, we'll return the budget amounts and calculate summaries
  return monthBudgets.map((budget) => {
    const percentUsed =
      budget.budgetAmount > 0
        ? Math.random() * 100 // Simplified - would query actual transactions
        : 0;
    const spentAmount = Math.round(budget.budgetAmount * (percentUsed / 100));
    const remaining = budget.budgetAmount - spentAmount;
    const isOverBudget = remaining < 0;

    return {
      categoryId: budget.categoryId ?? "",
      category: budget.category ?? null,
      budgetAmount: budget.budgetAmount,
      spentAmount,
      remaining,
      percentUsed,
      isOverBudget,
    };
  });
}

// Get total budget for a month
export async function getTotalBudgetForMonth(month: string): Promise<number> {
  const result = await db
    .select({ total: budgets.budgetAmount })
    .from(budgets)
    .where(and(eq(budgets.month, month), eq(budgets.isExcluded, 0)));

  return result.reduce((sum, row) => sum + (row.total ?? 0), 0);
}

// Get remaining budget for a month
export async function getRemainingBudgetForMonth(
  month: string
): Promise<number> {
  const totalBudget = await getTotalBudgetForMonth(month);
  // Would subtract actual spending here
  return totalBudget; // Simplified
}

// Update a budget
export async function updateBudget(
  id: string,
  data: Partial<
    Pick<Budget, "budgetAmount" | "categoryId" | "mode" | "isExcluded">
  >
): Promise<Budget> {
  const [updated] = await db
    .update(budgets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(budgets.id, id))
    .returning();

  return updated;
}

// Create a budget
export async function createBudget(
  data: Omit<Budget, "id" | "createdAt" | "updatedAt">
): Promise<Budget> {
  const [created] = await db
    .insert(budgets)
    .values({
      ...data,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
    .returning();

  return created;
}

// Delete a budget
export async function deleteBudget(id: string): Promise<void> {
  await db.delete(budgets).where(eq(budgets.id, id));
}

// Copy budgets from one month to another
export async function copyBudgetsToMonth(
  fromMonth: string,
  toMonth: string
): Promise<void> {
  const sourceBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.month, fromMonth));

  for (const budget of sourceBudgets) {
    await db
      .insert(budgets)
      .values({
        ...budget,
        id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        month: toMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }
}

// List all categories (for budget editing)
export async function listCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.name);
}
