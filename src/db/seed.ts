import { eq } from "drizzle-orm";
import {
  accounts,
  balanceSnapshots,
  budgets,
  cashflowSnapshots,
  categories,
  db,
  investments,
  recurrings,
  savingsGoals,
  settings,
  transactions,
} from "./client";

// Seed configuration
const SEED_CONFIG = {
  // Current month for calculations
  currentYear: 2026,
  currentMonth: 2, // March = 2 (0-indexed)
  seed: 42,
};

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const random = seededRandom(SEED_CONFIG.seed);

// Generate deterministic IDs
function generateId(prefix: string, index: number): string {
  return `${prefix}_${index}_${SEED_CONFIG.seed}`;
}

// Date helpers
function getDateDaysAgo(days: number): Date {
  const date = new Date(SEED_CONFIG.currentYear, SEED_CONFIG.currentMonth, 15); // Middle of current month
  date.setDate(date.getDate() - days);
  return date;
}

function getMonthStart(monthsAgo: number): string {
  const date = new Date(
    SEED_CONFIG.currentYear,
    SEED_CONFIG.currentMonth - monthsAgo,
    1,
  );
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

// Categories seed data
const CATEGORIES_DATA = [
  { id: "cat_food", name: "Food & Drink", emoji: "🍔", color: "#FF9500" },
  { id: "cat_groceries", name: "Groceries", emoji: "🛒", color: "#34C759" },
  { id: "cat_transport", name: "Transport", emoji: "🚗", color: "#007AFF" },
  { id: "cat_shopping", name: "Shopping", emoji: "🛍️", color: "#AF52DE" },
  {
    id: "cat_entertainment",
    name: "Entertainment",
    emoji: "🎬",
    color: "#FF2D55",
  },
  { id: "cat_bills", name: "Bills & Utilities", emoji: "💡", color: "#5856D6" },
  { id: "cat_health", name: "Health", emoji: "🏥", color: "#FF3B30" },
  { id: "cat_income", name: "Income", emoji: "💰", color: "#30D158" },
  { id: "cat_other", name: "Other", emoji: "📦", color: "#8E8E93" },
  {
    id: "cat_excluded",
    name: "Excluded",
    emoji: "🚫",
    color: "#6B7280",
    kind: "excluded" as const,
  },
];

function formatDateYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Accounts seed data
const ACCOUNTS_DATA = [
  {
    id: "acc_chase_visa",
    name: "Chase Sapphire",
    type: "credit_card" as const,
    balance: -425000,
    available: 1575000,
    utilizedPct: 0.27,
    institution: "Chase",
    mask: "4521",
    color: "#1A1F71",
    creditLimit: 2000000,
  },
  {
    id: "acc_amex_gold",
    name: "Amex Gold",
    type: "credit_card" as const,
    balance: -180000,
    available: 820000,
    utilizedPct: 0.18,
    institution: "American Express",
    mask: "3001",
    color: "#006FCF",
    creditLimit: 1000000,
  },
  {
    id: "acc_bofa_checking",
    name: "BoFA Checking",
    type: "depository" as const,
    balance: 850000,
    available: 850000,
    institution: "Bank of America",
    mask: "8832",
    color: "#012169",
  },
  {
    id: "acc_bofa_savings",
    name: "BoFA Savings",
    type: "depository" as const,
    balance: 2500000,
    available: 2500000,
    institution: "Bank of America",
    mask: "2291",
    color: "#012169",
  },
  {
    id: "acc_vanguard_401k",
    name: "Vanguard 401k",
    type: "manual_investment" as const,
    balance: 45000000,
    isExcludedFromNetWorth: 0,
    institution: "Vanguard",
    mask: "4011",
    color: "#96151D",
  },
  {
    id: "acc_fidelity_ira",
    name: "Fidelity IRA",
    type: "manual_investment" as const,
    balance: 12500000,
    isExcludedFromNetWorth: 0,
    institution: "Fidelity",
    mask: "1234",
    color: "#4AA148",
  },
];

function generateBalanceSnapshots(): {
  id: string;
  accountId: string;
  date: string;
  balanceAmount: number;
}[] {
  const rows: {
    id: string;
    accountId: string;
    date: string;
    balanceAmount: number;
  }[] = [];
  const daysBack = 120;
  const anchor = new Date(SEED_CONFIG.currentYear, SEED_CONFIG.currentMonth, 15);

  for (let i = 0; i <= daysBack; i++) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - (daysBack - i));
    const dateStr = formatDateYMD(d);
    const progress = i / Math.max(daysBack, 1);

    for (const acc of ACCOUNTS_DATA) {
      const end = acc.balance;
      const start = Math.floor(end * 0.94);
      const wobble = Math.floor((random() - 0.5) * 25000);
      let balanceAmount =
        i === daysBack
          ? end
          : Math.floor(start + (end - start) * progress + wobble);
      rows.push({
        id: `${acc.id}_${dateStr}`,
        accountId: acc.id,
        date: dateStr,
        balanceAmount,
      });
    }
  }

  return rows;
}

// Transactions seed data
function generateTransactions() {
  const transactions = [];

  // Income - recurring salary
  for (let i = 0; i < 3; i++) {
    transactions.push({
      id: generateId("txn_income", i),
      date: getDateDaysAgo(i * 30),
      name: "Payroll - Acme Corp",
      amount: 850000, // $8,500
      currency: "USD",
      type: "income" as const,
      accountId: "acc_bofa_checking",
      categoryId: "cat_income",
      needsReview: 0,
    });
  }

  // Regular transactions over the last 60 days
  const merchants = [
    { name: "Whole Foods", categoryId: "cat_groceries", amount: -8500 },
    { name: "Trader Joes", categoryId: "cat_groceries", amount: -6200 },
    { name: "Shell Gas Station", categoryId: "cat_transport", amount: -4500 },
    { name: "Uber", categoryId: "cat_transport", amount: -2400 },
    { name: "Netflix", categoryId: "cat_entertainment", amount: -1599 },
    { name: "Spotify", categoryId: "cat_entertainment", amount: -1099 },
    { name: "Amazon", categoryId: "cat_shopping", amount: -4500 },
    { name: "Target", categoryId: "cat_shopping", amount: -7800 },
    { name: "Electric Company", categoryId: "cat_bills", amount: -12500 },
    { name: "Internet Provider", categoryId: "cat_bills", amount: -8999 },
    { name: "Gym Membership", categoryId: "cat_health", amount: -4900 },
    { name: "CVS Pharmacy", categoryId: "cat_health", amount: -1500 },
    { name: "Chipotle", categoryId: "cat_food", amount: -1400 },
    { name: "Starbucks", categoryId: "cat_food", amount: -650 },
    { name: "DoorDash", categoryId: "cat_food", amount: -3200 },
  ];

  for (let i = 0; i < 45; i++) {
    const merchant = merchants[Math.floor(random() * merchants.length)];
    const dayOffset = Math.floor(random() * 60);
    const account = random() > 0.3 ? "acc_chase_visa" : "acc_amex_gold";

    transactions.push({
      id: generateId("txn", i),
      date: getDateDaysAgo(dayOffset),
      name: merchant.name,
      amount: merchant.amount,
      currency: "USD",
      type: "regular" as const,
      categoryId: merchant.categoryId,
      accountId: account,
      needsReview: random() > 0.9 ? 1 : 0, // 10% need review
    });
  }

  // Some need review
  transactions.push({
    id: "txn_review_1",
    date: getDateDaysAgo(2),
    name: "New Merchant Detected",
    amount: -45000,
    currency: "USD",
    type: "regular" as const,
    categoryId: null,
    accountId: "acc_chase_visa",
    needsReview: 1,
  });

  return transactions;
}

// Budgets seed data
const BUDGETS_DATA = [
  {
    id: "budget_food_0",
    month: getMonthStart(0),
    categoryId: "cat_food",
    budgetAmount: 50000,
  },
  {
    id: "budget_groceries_0",
    month: getMonthStart(0),
    categoryId: "cat_groceries",
    budgetAmount: 40000,
  },
  {
    id: "budget_transport_0",
    month: getMonthStart(0),
    categoryId: "cat_transport",
    budgetAmount: 25000,
  },
  {
    id: "budget_shopping_0",
    month: getMonthStart(0),
    categoryId: "cat_shopping",
    budgetAmount: 30000,
  },
  {
    id: "budget_entertainment_0",
    month: getMonthStart(0),
    categoryId: "cat_entertainment",
    budgetAmount: 20000,
  },
  {
    id: "budget_bills_0",
    month: getMonthStart(0),
    categoryId: "cat_bills",
    budgetAmount: 35000,
  },
  {
    id: "budget_health_0",
    month: getMonthStart(0),
    categoryId: "cat_health",
    budgetAmount: 15000,
  },
  {
    id: "budget_other_0",
    month: getMonthStart(0),
    categoryId: "cat_other",
    budgetAmount: 15000,
  },
];

// Recurrings seed data
const RECURRINGS_DATA = [
  {
    id: "rec_1",
    name: "Netflix",
    emoji: "🎬",
    categoryId: "cat_entertainment",
    frequency: "monthly" as const,
    amountMin: 1599,
    amountMax: 1599,
    nextPaymentDate: getDateDaysAgo(5),
  },
  {
    id: "rec_2",
    name: "Spotify",
    emoji: "🎵",
    categoryId: "cat_entertainment",
    frequency: "monthly" as const,
    amountMin: 1099,
    amountMax: 1099,
    nextPaymentDate: getDateDaysAgo(12),
  },
  {
    id: "rec_3",
    name: "Gym Membership",
    emoji: "💪",
    categoryId: "cat_health",
    frequency: "monthly" as const,
    amountMin: 4900,
    amountMax: 4900,
    nextPaymentDate: getDateDaysAgo(1),
  },
  {
    id: "rec_4",
    name: "Electric Bill",
    emoji: "⚡",
    categoryId: "cat_bills",
    frequency: "monthly" as const,
    amountMin: 10000,
    amountMax: 15000,
    nextPaymentDate: getDateDaysAgo(8),
  },
  {
    id: "rec_5",
    name: "Internet",
    emoji: "🌐",
    categoryId: "cat_bills",
    frequency: "monthly" as const,
    amountMin: 8999,
    amountMax: 8999,
    nextPaymentDate: getDateDaysAgo(15),
  },
  {
    id: "rec_6",
    name: "Car Insurance",
    emoji: "🚗",
    categoryId: "cat_bills",
    frequency: "monthly" as const,
    amountMin: 15000,
    amountMax: 15000,
    nextPaymentDate: getDateDaysAgo(3),
  },
];

// Savings Goals seed data
const SAVINGS_GOALS_DATA = [
  {
    id: "goal_1",
    name: "Emergency Fund",
    emoji: "🏠",
    targetAmount: 1000000,
    savedAmount: 650000,
    targetMonth: "2026-06",
    status: "active" as const,
  },
  {
    id: "goal_2",
    name: "Vacation",
    emoji: "✈️",
    targetAmount: 500000,
    savedAmount: 225000,
    targetMonth: "2026-08",
    status: "active" as const,
  },
  {
    id: "goal_3",
    name: "New Laptop",
    emoji: "💻",
    targetAmount: 200000,
    savedAmount: 200000,
    targetMonth: "2026-04",
    status: "ready_to_spend" as const,
  },
];

// Investments seed data
const INVESTMENTS_DATA = [
  {
    id: "inv_1",
    groupName: "US Stocks",
    allocationPct: 50,
    holdingsData: JSON.stringify([
      { symbol: "VTI", name: "Vanguard Total Stock", value: 28750000 },
      { symbol: "VOO", name: "Vanguard S&P 500", value: 16250000 },
    ]),
  },
  {
    id: "inv_2",
    groupName: "International",
    allocationPct: 20,
    holdingsData: JSON.stringify([
      { symbol: "VXUS", name: "Vanguard Intl Stock", value: 11500000 },
    ]),
  },
  {
    id: "inv_3",
    groupName: "Bonds",
    allocationPct: 15,
    holdingsData: JSON.stringify([
      { symbol: "BND", name: "Vanguard Total Bond", value: 8625000 },
    ]),
  },
  {
    id: "inv_4",
    groupName: "Real Estate",
    allocationPct: 15,
    holdingsData: JSON.stringify([
      { symbol: "VNQ", name: "Vanguard Real Estate", value: 8625000 },
    ]),
  },
];

// Cashflow Snapshots seed data
function generateCashflowSnapshots() {
  const snapshots = [];

  for (let i = 5; i >= 0; i--) {
    const month = getMonthStart(i);
    const baseIncome = 850000;
    const baseSpend = 180000 + Math.floor(random() * 5) * 10000;
    const excluded = Math.floor(random() * 20000);

    snapshots.push({
      id: `cf_${month}`,
      month,
      income: baseIncome,
      spend: baseSpend,
      excludedSpend: excluded,
      netIncome: baseIncome - baseSpend,
    });
  }

  return snapshots;
}

// Main seed function
export async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Insert categories
    await db.insert(categories).values(CATEGORIES_DATA).onConflictDoNothing();
    console.log("Seeded categories");

    // Insert accounts
    await db.insert(accounts).values(ACCOUNTS_DATA).onConflictDoNothing();
    console.log("Seeded accounts");

    const balanceRows = generateBalanceSnapshots();
    await db.insert(balanceSnapshots).values(balanceRows).onConflictDoNothing();
    console.log(`Seeded ${balanceRows.length} balance snapshot rows`);

    // Insert transactions
    const txns = generateTransactions();
    await db.insert(transactions).values(txns).onConflictDoNothing();
    console.log(`Seeded ${txns.length} transactions`);

    // Insert budgets
    await db.insert(budgets).values(BUDGETS_DATA).onConflictDoNothing();
    console.log("Seeded budgets");

    // Insert recurrings
    await db.insert(recurrings).values(RECURRINGS_DATA).onConflictDoNothing();
    console.log("Seeded recurrings");

    // Insert savings goals
    await db
      .insert(savingsGoals)
      .values(SAVINGS_GOALS_DATA)
      .onConflictDoNothing();
    console.log("Seeded savings goals");

    // Insert investments
    await db.insert(investments).values(INVESTMENTS_DATA).onConflictDoNothing();
    console.log("Seeded investments");

    // Insert cashflow snapshots
    const cfSnapshots = generateCashflowSnapshots();
    await db
      .insert(cashflowSnapshots)
      .values(cfSnapshots)
      .onConflictDoNothing();
    console.log("Seeded cashflow snapshots");

    // Insert settings
    await db
      .insert(settings)
      .values({
        id: "default",
        currency: "USD",
        budgetingEnabled: 1,
        netWorthTimeframe: "1M",
      })
      .onConflictDoNothing();
    console.log("Seeded settings");

    console.log("Database seed completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if database is empty
export async function runSeedIfEmpty() {
  try {
    const existingSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.id, "default"))
      .limit(1);

    if (existingSettings.length === 0) {
      console.log("Database is empty, running seed...");
      await seedDatabase();
      return true;
    }

    console.log("Database already has data, skipping seed");
    return false;
  } catch (error) {
    console.log("Database not ready yet, will seed on initialization", error);
    return false;
  }
}
