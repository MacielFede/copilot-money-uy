import type { BudgetSummary } from "@/features/dashboard/services/dashboardService";
import { formatMoney } from "@/utils/money";
import { memo, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { router } from "expo-router";

interface BudgetItemProps {
  emoji: string;
  name: string;
  totalSpentCents: number;
  slicePercent: number;
  accent: string;
  track: string;
  center: string;
}

const BudgetItem = memo(function BudgetItem({
  emoji,
  name,
  totalSpentCents,
  slicePercent,
  accent,
  track,
  center,
}: BudgetItemProps) {
  const { theme } = useUnistyles();
  const pct = Math.min(100, Math.max(0, slicePercent));
  const rest = Math.max(0, 100 - pct);

  return (
    <View style={styles.item}>
      <PieChart
        data={[
          { value: pct, color: accent },
          { value: rest, color: track },
        ]}
        donut
        radius={32}
        innerRadius={26}
        innerCircleColor={center}
        centerLabelComponent={() => (
          <Text style={styles.emoji}>{emoji}</Text>
        )}
      />
      <Text style={[styles.amount, { color: theme.colors.text }]} numberOfLines={1}>
        {formatMoney(totalSpentCents, true)}
      </Text>
      <Text
        style={[styles.name, { color: theme.colors.textSecondary }]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
});

export interface BudgetScrollProps {
  budgets: BudgetSummary[];
}

export const BudgetScroll = memo(function BudgetScroll({
  budgets,
}: BudgetScrollProps) {
  const { theme } = useUnistyles();

  const totalSpent = useMemo(
    () => budgets.reduce((s, b) => s + b.spentAmount, 0),
    [budgets],
  );

  const track = `${theme.colors.textTertiary}55`;

  if (budgets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          BUDGETS
        </Text>
        <Pressable onPress={() => router.push("/(tabs)/budgets")}>
          <Text style={[styles.viewAll, { color: theme.colors.text }]}>
            Categories ›
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {budgets.map((b) => {
          const emoji = b.category?.emoji ?? "📦";
          const name = b.category?.name ?? "Other";
          const accent = b.category?.color ?? theme.colors.tint;
          const slicePercent =
            totalSpent > 0 ? (b.spentAmount / totalSpent) * 100 : 0;
          return (
            <BudgetItem
              key={b.categoryId}
              emoji={emoji}
              name={name}
              totalSpentCents={b.spentAmount}
              slicePercent={slicePercent}
              accent={accent}
              track={track}
              center={theme.colors.card}
            />
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.8,
  },
  viewAll: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  item: {
    width: 92,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  emoji: {
    fontSize: theme.typography.fontSize.lg,
  },
  amount: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  name: {
    fontSize: theme.typography.fontSize.xs,
    textAlign: "center",
  },
}));
