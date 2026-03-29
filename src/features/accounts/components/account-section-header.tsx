import { MoneyText } from "@/components/ui/money-text";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface AccountSectionHeaderProps {
  label: string;
  totalCents: number;
}

export function AccountSectionHeader({
  label,
  totalCents,
}: AccountSectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <MoneyText
        amount={totalCents}
        variant="compact"
        style={styles.totalAmount}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  totalAmount: {
    color: theme.colors.textSecondary,
  },
}));
