import { db, savingsGoals, type SavingsGoal } from "@/src/db/client";
import { desc, eq } from "drizzle-orm";

export interface SavingsGoalWithProgress extends SavingsGoal {
  progress: number;
  monthsRemaining: number;
  isOnTrack: boolean;
}

// Get all savings goals
export async function listSavingsGoals(): Promise<SavingsGoal[]> {
  return db.select().from(savingsGoals).orderBy(desc(savingsGoals.createdAt));
}

// Get active savings goals
export async function getActiveGoals(): Promise<SavingsGoalWithProgress[]> {
  const goals = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.status, "active"))
    .orderBy(savingsGoals.targetMonth);

  return goals.map((goal) => calculateGoalProgress(goal));
}

// Get ready to spend goals
export async function getReadyToSpendGoals(): Promise<
  SavingsGoalWithProgress[]
> {
  const goals = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.status, "ready_to_spend"))
    .orderBy(desc(savingsGoals.updatedAt));

  return goals.map((goal) => calculateGoalProgress(goal));
}

// Get archived goals
export async function getArchivedGoals(): Promise<SavingsGoalWithProgress[]> {
  const goals = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.status, "archived"))
    .orderBy(desc(savingsGoals.updatedAt));

  return goals.map((goal) => calculateGoalProgress(goal));
}

// Calculate goal progress
function calculateGoalProgress(goal: SavingsGoal): SavingsGoalWithProgress {
  const saved = goal.savedAmount ?? 0;
  const progress =
    goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;

  // Calculate months remaining
  let monthsRemaining = 0;
  if (goal.targetMonth) {
    const target = new Date(goal.targetMonth + "-01");
    const now = new Date();
    monthsRemaining = Math.max(
      0,
      (target.getFullYear() - now.getFullYear()) * 12 +
        (target.getMonth() - now.getMonth())
    );
  }

  // Determine if on track (simplified - assumes linear progress)
  const expectedProgress =
    monthsRemaining > 0 ? ((12 - monthsRemaining) / 12) * 100 : 100;
  const isOnTrack = progress >= expectedProgress * 0.8; // 80% of expected

  return {
    ...goal,
    progress,
    monthsRemaining,
    isOnTrack,
  };
}

// Get a single goal
export async function getSavingsGoal(id: string): Promise<SavingsGoal | null> {
  const result = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.id, id))
    .limit(1);
  return result[0] ?? null;
}

// Update savings goal
export async function updateSavingsGoal(
  id: string,
  data: Partial<
    Pick<
      SavingsGoal,
      | "name"
      | "emoji"
      | "targetAmount"
      | "savedAmount"
      | "targetMonth"
      | "status"
    >
  >
): Promise<SavingsGoal> {
  const [updated] = await db
    .update(savingsGoals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(savingsGoals.id, id))
    .returning();

  return updated;
}

// Create savings goal
export async function createSavingsGoal(
  data: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">
): Promise<SavingsGoal> {
  const [created] = await db
    .insert(savingsGoals)
    .values({
      ...data,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
    .returning();

  return created;
}

// Delete savings goal
export async function deleteSavingsGoal(id: string): Promise<void> {
  await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
}

// Add to savings goal
export async function addToSavingsGoal(
  id: string,
  amount: number
): Promise<SavingsGoal> {
  const goal = await getSavingsGoal(id);
  if (!goal) throw new Error("Goal not found");

  const newSavedAmount = (goal.savedAmount ?? 0) + amount;
  const newStatus =
    newSavedAmount >= goal.targetAmount ? "ready_to_spend" : goal.status;

  return updateSavingsGoal(id, {
    savedAmount: newSavedAmount,
    status: newStatus as "active" | "ready_to_spend" | "archived",
  });
}

// Get total saved across all goals
export async function getTotalSaved(): Promise<number> {
  const goals = await listSavingsGoals();
  return goals.reduce((total, goal) => total + (goal.savedAmount ?? 0), 0);
}

// Get total target across all goals
export async function getTotalTarget(): Promise<number> {
  const goals = await listSavingsGoals();
  return goals.reduce((total, goal) => total + goal.targetAmount, 0);
}
