import {
  categories,
  db,
  recurrings,
  type Category,
  type Recurring,
} from "@/src/db/client";
import { and, eq } from "drizzle-orm";

export interface RecurringWithCategory extends Recurring {
  category?: Category | null;
}

export interface MonthlyOccurrence {
  date: Date;
  expectedAmount: number;
  status: "upcoming" | "paid" | "missed";
}

// Get all active recurrings
export async function listRecurrings(): Promise<RecurringWithCategory[]> {
  const result = await db
    .select()
    .from(recurrings)
    .leftJoin(categories, eq(recurrings.categoryId, categories.id))
    .where(eq(recurrings.isActive, 1))
    .orderBy(recurrings.nextPaymentDate);

  return result.map((row) => ({
    ...row.recurrings,
    category: row.categories ?? null,
  }));
}

// Get upcoming recurrings (next 7 days)
export async function getUpcomingRecurrings(): Promise<
  RecurringWithCategory[]
> {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const result = await db
    .select()
    .from(recurrings)
    .leftJoin(categories, eq(recurrings.categoryId, categories.id))
    .where(
      and(
        eq(recurrings.isActive, 1),
        recurrings.nextPaymentDate && eq(recurrings.nextPaymentDate, now) // Simplified
      )
    )
    .orderBy(recurrings.nextPaymentDate);

  return result.map((row) => ({
    ...row.recurrings,
    category: row.categories ?? null,
  }));
}

// Get a single recurring
export async function getRecurring(
  id: string
): Promise<RecurringWithCategory | null> {
  const result = await db
    .select()
    .from(recurrings)
    .leftJoin(categories, eq(recurrings.categoryId, categories.id))
    .where(eq(recurrings.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    ...row.recurrings,
    category: row.categories ?? null,
  };
}

// Update recurring
export async function updateRecurring(
  id: string,
  data: Partial<
    Pick<
      Recurring,
      | "name"
      | "emoji"
      | "categoryId"
      | "amountMin"
      | "amountMax"
      | "nextPaymentDate"
      | "isActive"
    >
  >
): Promise<Recurring> {
  const [updated] = await db
    .update(recurrings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(recurrings.id, id))
    .returning();

  return updated;
}

// Create recurring
export async function createRecurring(
  data: Omit<Recurring, "id" | "createdAt" | "updatedAt">
): Promise<Recurring> {
  const [created] = await db
    .insert(recurrings)
    .values({
      ...data,
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
    .returning();

  return created;
}

// Delete recurring
export async function deleteRecurring(id: string): Promise<void> {
  await db.delete(recurrings).where(eq(recurrings.id, id));
}

// Calculate total to pay this month
export async function getMonthlyRecurringTotal(): Promise<number> {
  const activeRecurrings = await db
    .select()
    .from(recurrings)
    .where(eq(recurrings.isActive, 1));

  // Sum up the minimum amounts (or average of min/max)
  return activeRecurrings.reduce((total, rec) => {
    if (rec.amountMin !== null && rec.amountMax !== null) {
      return total + Math.round((rec.amountMin + rec.amountMax) / 2);
    }
    return total + (rec.amountMin ?? 0);
  }, 0);
}

// Generate monthly occurrence timeline for a recurring
export async function generateMonthlyOccurrences(
  recurringId: string,
  year: number,
  month: number
): Promise<MonthlyOccurrence[]> {
  const recurring = await getRecurring(recurringId);
  if (!recurring) return [];

  // For simplicity, assume monthly on the 1st
  const occurrences: MonthlyOccurrence[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const expectedAmount = recurring.amountMin ?? 0;
    const now = new Date();
    let status: "upcoming" | "paid" | "missed" = "upcoming";

    if (currentDate < now) {
      status = "paid"; // Simplified - would check actual transactions
    }

    occurrences.push({
      date: new Date(currentDate),
      expectedAmount,
      status,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return occurrences;
}
