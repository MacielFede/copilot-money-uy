import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { MoneyText } from "@/components/ui/money-text";

export interface TransactionMonthHeaderProps {
  label: string;
  monthSpendCents: number;
}

export function TransactionMonthHeader({
  label,
  monthSpendCents,
}: TransactionMonthHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{label}</Text>
      <MoneyText
        amount={monthSpendCents}
        variant="absolute"
        style={styles.amount}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.copilotNavy,
  },
  amount: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.copilotNavy,
  },
}));
