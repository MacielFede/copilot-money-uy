import { MoneyText } from "@/components/ui/money-text";
import type { Account } from "@/src/db/schema";
import { memo } from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface AccountRowProps {
  account: Account;
  changePercent: number;
}

function getBalanceLabel(type: string): string {
  return type === "depository" ||
    type === "investment" ||
    type === "manual_investment"
    ? "AVAILABLE"
    : "BALANCE";
}

export const AccountRow = memo(function AccountRow({
  account,
  changePercent,
}: AccountRowProps) {
  const { theme } = useUnistyles();
  const isCredit = account.type === "credit_card";
  const utilization =
    isCredit && account.creditLimit != null && account.creditLimit > 0
      ? (Math.abs(account.balance) / account.creditLimit) * 100
      : null;
  const badgeColor = account.color ?? theme.colors.tint;
  const isPositiveChange = changePercent >= 0;

  return (
    <View style={styles.row}>
      <View style={styles.card(badgeColor)}>
        <Text style={styles.cardInstitution} numberOfLines={1}>
          {account.institution ?? "Account"}
        </Text>
        <View style={styles.cardFooter}>
          <Text
            style={styles.cardName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {account.name}
          </Text>
          <Text style={styles.cardMask} numberOfLines={1}>
            {account.mask ?? "—"}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>{getBalanceLabel(account.type)}</Text>
          <MoneyText
            amount={account.balance}
            variant="compact"
            style={styles.balanceValue}
          />
        </View>

        <View style={styles.metricColEnd}>
          {isCredit && account.creditLimit != null && account.creditLimit > 0 ? (
            <>
              <Text style={styles.metricLabel}>UTILIZED</Text>
              <Text style={styles.utilizationValue}>
                {`${(utilization ?? 0).toFixed(2)}%`}
              </Text>
            </>
          ) : isCredit ? (
            <>
              <Text style={styles.metricLabel}>UTILIZED</Text>
              <Text style={styles.metricPlaceholder}>—</Text>
            </>
          ) : (
            <>
              <Text style={styles.metricLabel}>30D</Text>
              <Text style={styles.changeValue(isPositiveChange)}>
                {isPositiveChange ? "+" : ""}
                {changePercent.toFixed(1)}%
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
});

const CARD_WIDTH = 140;

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: (backgroundColor: string) => ({
    width: CARD_WIDTH,
    aspectRatio: 1.75,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor,
    justifyContent: "space-between",
  }),
  cardInstitution: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnNavy,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
  },
  cardName: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textOnNavy,
    opacity: 0.95,
  },
  cardMask: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textOnNavy,
    opacity: 0.95,
  },
  metrics: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  metricCol: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
  },
  metricColEnd: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: theme.spacing.xxs,
    color: theme.colors.textSecondary,
  },
  balanceValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  utilizationValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  metricPlaceholder: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textTertiary,
  },
  changeValue: (positive: boolean) => ({
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: positive ? theme.colors.success : theme.colors.error,
  }),
}));
