import {
  createTransaction,
  getTransaction,
  updateTransaction,
  type TransactionUpdatePayload,
} from "@/features/transactions/services/transactionsService";
import type { Transaction } from "@/src/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export type TransactionTypeUi = "regular" | "income" | "transfer";

export interface TransactionFormState {
  date: Date;
  name: string;
  amountAbsCents: number;
  type: TransactionTypeUi;
  currency: string;
  accountId: string | null;
  categoryId: string | null;
  notes: string;
  isExcluded: boolean;
  isRecurring: boolean;
  needsReview: boolean;
  tagId: string | null;
  goalId: string | null;
}

function signedAmountFromForm(
  amountAbsCents: number,
  type: TransactionTypeUi
): number {
  const abs = Math.abs(amountAbsCents);
  if (type === "income") return abs;
  return -abs;
}

function defaultFormState(): TransactionFormState {
  const now = new Date();
  return {
    date: now,
    name: "",
    amountAbsCents: 0,
    type: "regular",
    currency: "USD",
    accountId: null,
    categoryId: null,
    notes: "",
    isExcluded: false,
    isRecurring: false,
    needsReview: false,
    tagId: null,
    goalId: null,
  };
}

function stateFromTransaction(row: Transaction): TransactionFormState {
  const abs = Math.abs(row.amount);
  let type: TransactionTypeUi = "regular";
  if (row.type === "income") type = "income";
  else if (row.type === "transfer") type = "transfer";
  return {
    date: new Date(row.date),
    name: row.name,
    amountAbsCents: abs,
    type,
    currency: row.currency ?? "USD",
    accountId: row.accountId ?? null,
    categoryId: row.categoryId ?? null,
    notes: row.notes ?? "",
    isExcluded: row.isExcluded === 1,
    isRecurring: row.isRecurring === 1,
    needsReview: row.needsReview === 1,
    tagId: row.tagId ?? null,
    goalId: row.goalId ?? null,
  };
}

export interface OriginalInfoSnapshot {
  name: string;
  date: Date;
  amountCents: number;
}

export function useTransactionEditForm(transactionId: string | undefined) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(transactionId);

  const { data: existing, isPending: isLoadingTxn } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransaction(transactionId!),
    enabled: isEdit,
  });

  const [form, setForm] = useState<TransactionFormState>(defaultFormState);
  const [originalInfo, setOriginalInfo] = useState<OriginalInfoSnapshot | null>(
    null
  );

  useEffect(() => {
    if (!existing) return;
    setForm(stateFromTransaction(existing));
    setOriginalInfo((prev) => {
      if (prev) return prev;
      return {
        name: existing.name,
        date: new Date(existing.date),
        amountCents: existing.amount,
      };
    });
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const amount = signedAmountFromForm(form.amountAbsCents, form.type);
      const base: TransactionUpdatePayload = {
        date: form.date,
        name: form.name.trim() || "Transaction",
        amount,
        currency: form.currency.trim() || "USD",
        type: form.type,
        accountId: form.accountId,
        categoryId: form.categoryId,
        notes: form.notes.trim() || null,
        isExcluded: form.isExcluded ? 1 : 0,
        isRecurring: form.isRecurring ? 1 : 0,
        needsReview: form.needsReview ? 1 : 0,
        tagId: form.tagId,
        goalId: form.goalId,
      };

      if (isEdit && transactionId) {
        return updateTransaction(transactionId, base);
      }

      const insert: Omit<Transaction, "id" | "createdAt" | "updatedAt"> = {
        date: base.date!,
        name: base.name!,
        amount: base.amount!,
        currency: base.currency ?? "USD",
        accountId: base.accountId ?? null,
        categoryId: base.categoryId ?? null,
        type: base.type ?? "regular",
        isExcluded: base.isExcluded ?? 0,
        isRecurring: base.isRecurring ?? 0,
        tagId: base.tagId ?? null,
        goalId: base.goalId ?? null,
        needsReview: base.needsReview ?? 0,
        notes: base.notes ?? null,
      };
      return createTransaction(insert);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["transaction"] });
    },
  });

  const updateField = useCallback(
    <K extends keyof TransactionFormState>(
      key: K,
      value: TransactionFormState[K]
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    isEdit,
    isLoadingTxn: isEdit && isLoadingTxn,
    existing,
    form,
    updateField,
    setForm,
    originalInfo,
    saveMutation,
  };
}
