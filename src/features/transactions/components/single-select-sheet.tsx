import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface SingleSelectItem {
  id: string;
  label: string;
  leading?: ReactNode;
}

export interface SingleSelectSheetProps {
  visible: boolean;
  title: string;
  items: SingleSelectItem[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string | null) => void;
  allowClear?: boolean;
}

export function SingleSelectSheet({
  visible,
  title,
  items,
  selectedId,
  onClose,
  onSelect,
  allowClear = true,
}: SingleSelectSheetProps) {
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
          <Text style={styles.title}>{title}</Text>
          {allowClear ? (
            <Pressable
              onPress={() => {
                onSelect(null);
                onClose();
              }}
              hitSlop={12}
            >
              <Text style={styles.headerBtn}>Clear</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {items.map((row) => {
            const on = selectedId === row.id;
            return (
              <Pressable
                key={row.id}
                style={styles.row}
                onPress={() => {
                  onSelect(row.id);
                  onClose();
                }}
              >
                {row.leading != null ? (
                  <View style={styles.leading}>{row.leading}</View>
                ) : null}
                <Text style={styles.rowLabel}>{row.label}</Text>
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
  headerSpacer: {
    width: 48,
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
  leading: {
    marginRight: theme.spacing.sm,
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
