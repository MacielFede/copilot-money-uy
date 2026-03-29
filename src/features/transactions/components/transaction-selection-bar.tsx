import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface TransactionSelectionBarProps {
  selectedCount: number;
}

export function TransactionSelectionBar({
  selectedCount,
}: TransactionSelectionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <View style={styles.selectionBar}>
      <Text style={styles.selectionText}>{selectedCount} selected</Text>
      <View style={styles.selectionActions}>
        <Pressable style={styles.selectionButton}>
          <Text style={styles.selectionButtonTextTint}>Category</Text>
        </Pressable>
        <Pressable style={styles.selectionButton}>
          <Text style={styles.selectionButtonTextTint}>Tag</Text>
        </Pressable>
        <Pressable style={styles.selectionButton}>
          <Text style={styles.selectionButtonTextDanger}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  selectionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    backgroundColor: theme.colors.card,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  selectionText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  selectionActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  selectionButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  selectionButtonTextTint: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.tint,
  },
  selectionButtonTextDanger: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.error,
  },
}));
