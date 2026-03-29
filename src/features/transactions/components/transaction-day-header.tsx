import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface TransactionDayHeaderProps {
  label: string;
}

export function TransactionDayHeader({ label }: TransactionDayHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.8,
    color: theme.colors.copilotMuted,
  },
}));
