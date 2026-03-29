import { MoneyText } from "@/components/ui/money-text";
import type { TransactionWithDetails } from "@/features/transactions/services/transactionsService";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface TransactionRowProps {
  transaction: TransactionWithDetails;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TransactionRow({
  transaction: item,
  onPress,
  onLongPress,
}: TransactionRowProps) {
  const { theme } = useUnistyles();
  const isExpense = item.amount < 0;
  const dotColor = item.category?.color ?? theme.colors.success;
  const categoryName = (item.category?.name ?? "UNCATEGORIZED").toUpperCase();
  const emoji = item.category?.emoji ?? "📁";

  return (
    <Pressable
      style={styles.transactionRow}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text numberOfLines={1}>{item.name}</Text>
      <View style={styles.badges}>
        {(item.needsReview === 1 || item.isRecurring === 1) && (
          <View style={styles.statusPill}>
            <View style={styles.statusDot(dotColor)} />
            <Text style={styles.statusText}>
              {item.needsReview === 1 ? "!" : "R"}
            </Text>
          </View>
        )}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryEmoji}>{emoji}</Text>
          <Text style={styles.categoryLabel} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
        <MoneyText
          amount={item.amount}
          variant="absolute"
          style={styles.amount(isExpense)}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flex: 1,
    marginRight: theme.spacing.md,
    minWidth: 0,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  statusDot: (color: string) => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    backgroundColor: color,
  }),
  statusText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.copilotNavy,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.categoryPillBg,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.4,
    color: theme.colors.categoryPillText,
    flexShrink: 1,
  },
  amount: (isExpense: boolean) => ({
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: isExpense ? theme.colors.copilotNavy : theme.colors.success,
  }),
}));
