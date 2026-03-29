export type AccountGroupKey =
  | "credit_cards"
  | "depository"
  | "investment"
  | "loan"
  | "other";

export type NetWorthTimeframe = "1W" | "1M" | "3M" | "6M" | "1Y";

export const NET_WORTH_TIMEFRAME_DAYS: Record<NetWorthTimeframe, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

export const NET_WORTH_TIMEFRAMES: NetWorthTimeframe[] = [
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
];

export const ACCOUNT_SECTION_ORDER: AccountGroupKey[] = [
  "credit_cards",
  "depository",
  "investment",
  "loan",
  "other",
];

const SECTION_LABELS: Record<AccountGroupKey, string> = {
  credit_cards: "Credit Cards",
  depository: "Depository",
  investment: "Investments",
  loan: "Loans",
  other: "Other",
};

export function getSectionLabel(key: AccountGroupKey): string {
  return SECTION_LABELS[key] ?? key;
}

export function isDebtAccountType(type: string): boolean {
  return type === "credit_card" || type === "loan";
}
