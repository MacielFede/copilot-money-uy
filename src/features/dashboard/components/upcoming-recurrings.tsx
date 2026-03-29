import type { UpcomingRecurring } from "@/features/dashboard/services/dashboardService";
import { daysUntilCalendarDate } from "@/features/dashboard/utils";
import { formatMoney } from "@/utils/money";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface RecurringItemProps {
  emoji: string;
  name: string;
  amountCents: number;
  daysUntilDue: number;
}

const RecurringItem = memo(function RecurringItem({
  emoji,
  name,
  amountCents,
  daysUntilDue,
}: RecurringItemProps) {
  const { theme } = useUnistyles();
  const daysLabel = () => {
    if (daysUntilDue === 0) return "Today";
    if (daysUntilDue < 0) return "Next Month";
    return `In ${daysUntilDue} days`;
  };

  return (
    <View style={[styles.item, { backgroundColor: theme.colors.card }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text
        style={[styles.name, { color: theme.colors.text }]}
        numberOfLines={2}
      >
        {name}
      </Text>
      <Text style={[styles.amount, { color: theme.colors.text }]}>
        {formatMoney(amountCents, true)}
      </Text>
      <Text style={[styles.daysLabel, { color: theme.colors.textSecondary }]}>
        {daysLabel()}
      </Text>
    </View>
  );
});

export interface UpcomingRecurringsProps {
  items: UpcomingRecurring[];
}

export const UpcomingRecurrings = memo(function UpcomingRecurrings({
  items,
}: UpcomingRecurringsProps) {
  const { theme } = useUnistyles();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[styles.headerLabel, { color: theme.colors.textSecondary }]}
        >
          UPCOMING
        </Text>
        <Pressable onPress={() => router.push("/(tabs)/recurrings")}>
          <Text style={[styles.viewAll, { color: theme.colors.text }]}>
            Recurrings ›
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <RecurringItem
            key={item.id}
            emoji={item.emoji ?? "📦"}
            name={item.name}
            amountCents={item.amount}
            daysUntilDue={daysUntilCalendarDate(item.nextPaymentDate)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  headerLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.8,
  },
  viewAll: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  item: {
    width: 108,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },
  emoji: {
    fontSize: theme.typography.fontSize.xxl,
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    minHeight: 36,
  },
  amount: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: 2,
  },
  daysLabel: {
    fontSize: theme.typography.fontSize.xs,
    textAlign: "center",
  },
}));
