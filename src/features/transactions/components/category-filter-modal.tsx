import type { Category } from "@/src/db/schema";
import { UNCATEGORIZED_CATEGORY_ID } from "@/features/transactions/services/transactionsService";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface CategoryFilterModalProps {
  visible: boolean;
  categories: Category[];
  selectedIds: Set<string>;
  onClose: () => void;
  onToggle: (categoryId: string) => void;
  onClear: () => void;
}

export function CategoryFilterModal({
  visible,
  categories,
  selectedIds,
  onClose,
  onToggle,
  onClear,
}: CategoryFilterModalProps) {
  const allRows = [
    { id: UNCATEGORIZED_CATEGORY_ID, name: "Uncategorized", emoji: "❔" },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji ?? "📁",
    })),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.headerBtn}>Done</Text>
          </Pressable>
          <Text style={styles.title}>Categories</Text>
          <Pressable onPress={onClear} hitSlop={12}>
            <Text style={styles.headerBtn}>Clear</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {allRows.map((row) => {
            const on = selectedIds.has(row.id);
            return (
              <Pressable
                key={row.id}
                style={styles.row}
                onPress={() => onToggle(row.id)}
              >
                <Text style={styles.emoji}>{row.emoji}</Text>
                <Text style={styles.rowLabel}>{row.name}</Text>
                <Text style={styles.check}>{on ? "✓" : ""}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  sheet: {
    flex: 1,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerBtn: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.tint,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  emoji: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  check: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    width: 24,
    textAlign: "center",
    color: theme.colors.tint,
  },
}));
