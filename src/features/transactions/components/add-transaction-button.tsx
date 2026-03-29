import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface AddTransactionButtonProps {
  onPress: () => void;
}

export function AddTransactionButton({ onPress }: AddTransactionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Text style={styles.label}>ADD A NEW TRANSACTION</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.addButtonBorder,
    backgroundColor: theme.colors.addButtonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.6,
    color: theme.colors.copilotAccentBlue,
  },
}));
