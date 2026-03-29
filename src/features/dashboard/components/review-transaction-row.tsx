import { MoneyText } from "@/components/ui/money-text";
import type { ToReviewItem } from "@/features/dashboard/services/dashboardService";
import { memo } from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface ReviewTransactionRowProps {
  item: ToReviewItem;
}

export const ReviewTransactionRow = memo(function ReviewTransactionRow({
  item,
}: ReviewTransactionRowProps) {
  const { theme } = useUnistyles();
  const cat = item.category;
  const label = (cat?.name ?? "Other").toUpperCase();
  const emoji = cat?.emoji ?? "🗂️";
  const tint = cat?.color ?? theme.colors.textTertiary;

  return (
    <View style={styles.row}>
      <Text style={styles.merchant} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.pillWrap}>
        <View style={styles.pill(tint)}>
          <Text style={styles.pillText} numberOfLines={1}>
            {emoji} {label}
          </Text>
        </View>
      </View>
      <MoneyText amount={item.amount} variant="compact" style={styles.amount} />
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  merchant: {
    flex: 1,
    minWidth: 0,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  pillWrap: {
    maxWidth: "42%",
  },
  pill: (borderColor: string) => ({
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${borderColor}28`,
    borderWidth: 1,
    borderColor: `${borderColor}55`,
  }),
  pillText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.4,
    color: theme.colors.text,
  },
  amount: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
}));
