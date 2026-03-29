import type { TransactionWithDetails } from "@/features/transactions/services/transactionsService";

export type TransactionListItem =
  | {
      type: "monthHeader";
      key: string;
      monthKey: string;
      label: string;
      monthSpendCents: number;
    }
  | { type: "dayHeader"; key: string; label: string }
  | { type: "transaction"; key: string; transaction: TransactionWithDetails };

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dayHeaderLabel(d: Date): string {
  const weekday = d
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const rest = d
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toUpperCase();
  return `${weekday}, ${rest}`;
}

/**
 * Builds a FlashList-ready list with month headers, day headers, and rows (newest-first pages merged).
 * `monthSpendByKey` maps `YYYY-MM` to total spending (positive cents) for that month (same filters as list).
 */
export function buildFlatListFromTransactions(
  rows: TransactionWithDetails[],
  monthSpendByKey: Record<string, number>
): TransactionListItem[] {
  const sorted = [...rows].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (tb !== ta) return tb - ta;
    return b.id.localeCompare(a.id);
  });

  const out: TransactionListItem[] = [];
  let lastDay = "";
  let lastMonth = "";

  for (const txn of sorted) {
    const d = new Date(txn.date);
    const mk = monthKey(d);
    const dk = dayKey(d);

    if (mk !== lastMonth) {
      lastMonth = mk;
      out.push({
        type: "monthHeader",
        key: `mh-${mk}`,
        monthKey: mk,
        label: monthLabel(d),
        monthSpendCents: monthSpendByKey[mk] ?? 0,
      });
      lastDay = "";
    }

    if (dk !== lastDay) {
      lastDay = dk;
      out.push({
        type: "dayHeader",
        key: `dh-${dk}`,
        label: dayHeaderLabel(d),
      });
    }

    out.push({
      type: "transaction",
      key: txn.id,
      transaction: txn,
    });
  }

  return out;
}
