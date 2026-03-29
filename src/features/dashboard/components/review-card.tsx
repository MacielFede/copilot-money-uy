import { markTransactionsReviewedForDate } from "@/features/dashboard/services/dashboardService";
import type { ToReviewDayGroup } from "@/features/dashboard/utils";
import { formatReviewDateLabel } from "@/features/dashboard/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { memo, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ReviewTransactionRow } from "./review-transaction-row";

const PEEK = 14;

export interface ReviewCardProps {
  dayGroups: ToReviewDayGroup[];
}

interface DayCardProps {
  group: ToReviewDayGroup;
  onDismiss: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}

const DayCard = memo(function DayCard({
  group,
  onDismiss,
  onLayout,
}: DayCardProps) {
  const { theme } = useUnistyles();

  return (
    <View
      onLayout={onLayout}
      style={[styles.dayCard, { borderColor: theme.colors.cardBorder }]}
    >
      <Text style={styles.dateLabel}>
        {formatReviewDateLabel(group.dateKey)}
      </Text>
      <View>
        {group.items.map((item) => (
          <ReviewTransactionRow key={item.id} item={item} />
        ))}
      </View>
      <Pressable
        style={[styles.reviewButton, { borderColor: theme.colors.divider }]}
        onPress={onDismiss}
      >
        <Text
          style={[
            styles.reviewButtonText,
            { color: theme.colors.textSecondary },
          ]}
        >
          MARK AS REVIEWED
        </Text>
      </Pressable>
    </View>
  );
});

export const ReviewCard = memo(function ReviewCard({
  dayGroups,
}: ReviewCardProps) {
  const { theme } = useUnistyles();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [topCardHeight, setTopCardHeight] = useState(0);

  const visibleGroups = useMemo(
    () => dayGroups.filter((g) => !dismissed.has(g.dateKey)),
    [dayGroups, dismissed],
  );

  const mutation = useMutation({
    mutationFn: markTransactionsReviewedForDate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "toReview"],
      });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const handleDismiss = (dateKey: string) => {
    setTopCardHeight(0);
    setDismissed((prev) => new Set([...prev, dateKey]));
    mutation.mutate(dateKey);
  };

  if (visibleGroups.length === 0) {
    return null;
  }

  const behindCount = Math.min(visibleGroups.length - 1, 2);
  const top = visibleGroups[0]!;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[styles.headerLabel, { color: theme.colors.textSecondary }]}
        >
          TO REVIEW
        </Text>
        <Pressable onPress={() => router.push("/(tabs)/transactions")}>
          <Text style={[styles.viewAll, { color: theme.colors.text }]}>
            View all ›
          </Text>
        </Pressable>
      </View>

      <View style={[styles.stack, { paddingBottom: behindCount * PEEK }]}>
        {behindCount >= 1 && topCardHeight > 0 ? (
          <View
            style={[
              styles.peekCard,
              {
                backgroundColor: theme.colors.card,
                top: topCardHeight,
              },
            ]}
          />
        ) : null}

        <DayCard
          group={top}
          onDismiss={() => handleDismiss(top.dateKey)}
          onLayout={(e) => setTopCardHeight(e.nativeEvent.layout.height)}
        />
      </View>
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
  stack: {
    position: "relative",
  },
  dayCard: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    ...theme.shadows.md,
  },
  peekCard: {
    alignSelf: "center",
    width: "95%",
    position: "absolute",
    height: PEEK,
    borderBottomRightRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  dateLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  reviewButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  reviewButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.6,
  },
}));
