import type { ToReviewItem } from "@/features/dashboard/services/dashboardService";

export interface ToReviewDayGroup {
  dateKey: string;
  items: ToReviewItem[];
}

export function groupToReviewByDay(
  items: ToReviewItem[],
  maxGroups = 3,
): ToReviewDayGroup[] {
  const map = new Map<string, ToReviewItem[]>();
  for (const it of items) {
    const d = new Date(it.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const arr = map.get(key) ?? [];
    arr.push(it);
    map.set(key, arr);
  }
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  return keys.slice(0, maxGroups).map((k) => ({
    dateKey: k,
    items: map.get(k)!,
  }));
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getYesterdayKey(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function formatReviewDateLabel(dateKey: string): string {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  if (dateKey === today) return "So far today";
  if (dateKey === yesterday) return "Yesterday";
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function daysUntilCalendarDate(next: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(next);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
