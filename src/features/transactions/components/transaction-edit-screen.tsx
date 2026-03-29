import { listAccounts } from "@/features/accounts/services/accountsService";
import { SingleSelectSheet } from "@/features/transactions/components/single-select-sheet";
import {
  useTransactionEditForm,
  type TransactionTypeUi,
} from "@/features/transactions/hooks/use-transaction-edit-form";
import {
  listCategoriesForTransactions,
  listSavingsGoalsForTransactions,
  listTagsForTransactions,
} from "@/features/transactions/services/transactionsService";
import type { Account } from "@/src/db/schema";
import { formatAbsoluteMoney, parseMoney } from "@/utils/money";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface TransactionEditScreenProps {
  transactionId: string | undefined;
}

const TYPE_OPTIONS: { value: TransactionTypeUi; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

export function TransactionEditScreen({
  transactionId,
}: TransactionEditScreenProps) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const {
    isEdit,
    isLoadingTxn,
    existing,
    form,
    updateField,
    originalInfo,
    saveMutation,
  } = useTransactionEditForm(transactionId);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "transaction-form"],
    queryFn: listCategoriesForTransactions,
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", "transaction-form"],
    queryFn: listAccounts,
  });
  const { data: tags = [] } = useQuery({
    queryKey: ["tags", "transaction-form"],
    queryFn: listTagsForTransactions,
  });
  const { data: goals = [] } = useQuery({
    queryKey: ["goals", "transaction-form"],
    queryFn: listSavingsGoalsForTransactions,
  });

  const [amountText, setAmountText] = useState("");
  const [showIosDateModal, setShowIosDateModal] = useState(false);
  const [showAndroidDate, setShowAndroidDate] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === form.accountId) ?? null,
    [accounts, form.accountId],
  );
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId) ?? null,
    [categories, form.categoryId],
  );
  const selectedTag = useMemo(
    () => tags.find((t) => t.id === form.tagId) ?? null,
    [tags, form.tagId],
  );
  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === form.goalId) ?? null,
    [goals, form.goalId],
  );

  const existingId = existing?.id;
  const existingAmountCents = existing?.amount ?? 0;

  useEffect(() => {
    if (existingId) {
      setAmountText((Math.abs(existingAmountCents) / 100).toFixed(2));
    } else if (!isEdit) {
      setAmountText("0.00");
    }
  }, [existingId, existingAmountCents, isEdit]);

  const dateLine = form.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const onDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === "android") {
      setShowAndroidDate(false);
    }
    if (date) updateField("date", date);
  };

  const onSave = () => {
    saveMutation.mutate(undefined, {
      onSuccess: () => router.back(),
    });
  };

  const categoryItems = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.name,
        leading: (
          <Text style={styles.categoryListEmoji}>{c.emoji ?? "📁"}</Text>
        ),
      })),
    [categories],
  );

  const accountItems = useMemo(
    () =>
      accounts.map((a) => ({
        id: a.id,
        label: `${a.name} (${a.mask ?? "—"})`,
      })),
    [accounts],
  );

  const tagItems = useMemo(
    () => tags.map((t) => ({ id: t.id, label: t.name })),
    [tags],
  );
  const goalItems = useMemo(
    () => goals.map((g) => ({ id: g.id, label: g.name })),
    [goals],
  );

  if (isEdit && isLoadingTxn) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionEyebrow}>TRANSACTION</Text>
        <Pressable
          onPress={() => {
            if (Platform.OS === "android") setShowAndroidDate(true);
            else setShowIosDateModal(true);
          }}
        >
          <Text style={styles.dateMuted}>{dateLine}</Text>
        </Pressable>

        <View style={styles.nameRow}>
          <TextInput
            style={styles.merchantTitle}
            value={form.name}
            onChangeText={(t) => updateField("name", t)}
            placeholder="Merchant"
            placeholderTextColor={theme.colors.textTertiary}
          />
          <Text style={styles.infoGlyph}>ⓘ</Text>
        </View>

        {isEdit && originalInfo && (
          <>
            <Text style={styles.sectionEyebrow}>ORIGINAL INFO</Text>
            <Text style={styles.originalBody}>
              {originalInfo.name}
              {"\n"}
              {originalInfo.date.toLocaleDateString("en-US")}{" "}
              {formatAbsoluteMoney(originalInfo.amountCents)}
            </Text>
          </>
        )}

        <TextInput
          style={styles.amountInput}
          value={amountText}
          onChangeText={(t) => {
            setAmountText(t);
            const cents = parseMoney(t);
            updateField("amountAbsCents", Math.abs(cents));
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.colors.textTertiary}
        />

        <TextInput
          style={styles.notes}
          value={form.notes}
          onChangeText={(t) => updateField("notes", t)}
          placeholder="Add a note"
          placeholderTextColor={theme.colors.textTertiary}
          multiline
        />

        <Text style={styles.sectionEyebrow}>CATEGORY</Text>
        <Pressable
          style={styles.categoryPill}
          onPress={() => setCategoryOpen(true)}
        >
          <Text style={styles.categoryEmoji}>
            {selectedCategory?.emoji ?? "📁"}
          </Text>
          <Text style={styles.categoryPillText} numberOfLines={1}>
            {(selectedCategory?.name ?? "Select category").toUpperCase()}
          </Text>
        </Pressable>

        <Text style={[styles.sectionEyebrow, styles.mt]}>ACCOUNT</Text>
        <AccountMiniCard
          account={selectedAccount}
          onPress={() => setAccountOpen(true)}
        />

        <Text style={[styles.sectionEyebrow, styles.mt]}>TYPE</Text>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((opt) => {
            const on = form.type === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={styles.typeChip(on)}
                onPress={() => updateField("type", opt.value)}
              >
                <Text style={styles.typeChipText(on)}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionEyebrow}>CURRENCY</Text>
        <TextInput
          style={styles.currencyInput}
          value={form.currency}
          onChangeText={(t) => updateField("currency", t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={3}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Excluded</Text>
          <Pressable
            onPress={() => updateField("isExcluded", !form.isExcluded)}
          >
            <Text style={styles.switchValue}>
              {form.isExcluded ? "Yes" : "No"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Needs review</Text>
          <Pressable
            onPress={() => updateField("needsReview", !form.needsReview)}
          >
            <Text style={styles.switchValue}>
              {form.needsReview ? "Yes" : "No"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerActions}>
          <Pressable style={styles.footerBtn} onPress={() => {}}>
            <Text style={styles.footerBtnText}>Split</Text>
          </Pressable>
          <Pressable
            style={styles.footerBtn}
            onPress={() => updateField("isRecurring", !form.isRecurring)}
          >
            <Text style={styles.footerBtnText}>
              Recurring{form.isRecurring ? " ✓" : ""}
            </Text>
          </Pressable>
          <Pressable style={styles.footerBtn} onPress={() => setTagOpen(true)}>
            <Text style={styles.footerBtnText}>Tag</Text>
          </Pressable>
        </View>

        {selectedTag && (
          <Text style={styles.metaHint}>Tag: {selectedTag.name}</Text>
        )}
        <Pressable onPress={() => setGoalOpen(true)}>
          <Text style={styles.metaHint}>
            Goal: {selectedGoal?.name ?? "None (tap to set)"}
          </Text>
        </Pressable>
      </ScrollView>

      {Platform.OS === "android" && showAndroidDate && (
        <DateTimePicker
          value={form.date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal visible={showIosDateModal} transparent animationType="fade">
          <View style={styles.iosDateOverlay}>
            <View style={styles.iosDateSheet}>
              <DateTimePicker
                value={form.date}
                mode="date"
                display="spinner"
                onChange={(_, d) => {
                  if (d) updateField("date", d);
                }}
              />
              <Pressable
                style={styles.iosDateDone}
                onPress={() => setShowIosDateModal(false)}
              >
                <Text style={styles.iosDateDoneText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <SingleSelectSheet
        visible={categoryOpen}
        title="Category"
        items={categoryItems}
        selectedId={form.categoryId}
        onClose={() => setCategoryOpen(false)}
        onSelect={(id) => updateField("categoryId", id)}
      />
      <SingleSelectSheet
        visible={accountOpen}
        title="Account"
        items={accountItems}
        selectedId={form.accountId}
        onClose={() => setAccountOpen(false)}
        onSelect={(id) => updateField("accountId", id)}
      />
      <SingleSelectSheet
        visible={tagOpen}
        title="Tag"
        items={tagItems}
        selectedId={form.tagId}
        onClose={() => setTagOpen(false)}
        onSelect={(id) => updateField("tagId", id)}
      />
      <SingleSelectSheet
        visible={goalOpen}
        title="Savings goal"
        items={goalItems}
        selectedId={form.goalId}
        onClose={() => setGoalOpen(false)}
        onSelect={(id) => updateField("goalId", id)}
      />

      <Pressable
        onPress={onSave}
        disabled={saveMutation.isPending}
        hitSlop={16}
        style={styles.saveButton}
      >
        {saveMutation.isPending ? (
          <ActivityIndicator color={theme.colors.tint} />
        ) : (
          <Text style={styles.topBarBtnPrimary}>Save</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

function AccountMiniCard({
  account,
  onPress,
}: {
  account: Account | null;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();
  const bg = account?.color ?? theme.colors.copilotAccentBlue;
  return (
    <Pressable onPress={onPress} style={styles.accountCard(bg)}>
      <Text style={styles.accountInstitution} numberOfLines={1}>
        {account?.institution ?? "Select account"}
      </Text>
      <Text style={styles.accountLine} numberOfLines={1}>
        {account
          ? `${account.name} ${account.mask ? `…${account.mask}` : ""}`
          : "Tap to choose"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarBtn: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.copilotMuted,
  },
  topBarBtnPrimary: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.tint,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxxl,
  },
  sectionEyebrow: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 1,
    color: theme.colors.copilotMuted,
  },
  mt: {
    marginTop: theme.spacing.xl,
  },
  dateMuted: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  merchantTitle: {
    flex: 1,
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.copilotNavy,
  },
  infoGlyph: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
  originalBody: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  amountInput: {
    marginTop: theme.spacing.xl,
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.copilotNavy,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    paddingVertical: theme.spacing.sm,
  },
  notes: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    minHeight: 44,
  },
  categoryPill: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.categoryPillBg,
  },
  categoryListEmoji: {
    fontSize: 18,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  categoryPillText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.5,
    color: theme.colors.categoryPillText,
    flexShrink: 1,
  },
  accountCard: (bg: string) => ({
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: bg,
    minHeight: 88,
    justifyContent: "flex-end",
  }),
  accountInstitution: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.lg,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnNavy,
    opacity: 0.95,
  },
  accountLine: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textOnNavy,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  typeChip: (on: boolean) => ({
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: on ? theme.colors.tint : theme.colors.divider,
    backgroundColor: on
      ? theme.colors.infoLight
      : theme.colors.backgroundSecondary,
  }),
  typeChipText: (on: boolean) => ({
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: on ? theme.colors.tint : theme.colors.copilotNavy,
  }),
  currencyInput: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    maxWidth: 96,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  switchLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  switchValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.tint,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footerActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    justifyContent: "space-between",
  },
  footerBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
  },
  footerBtnText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.copilotNavy,
  },
  metaHint: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  iosDateOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  iosDateSheet: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingBottom: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  iosDateDone: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  iosDateDoneText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.tint,
  },
  saveButton: {
    alignSelf: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
  },
}));
