import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AddTransactionButton } from "@/features/transactions/components/add-transaction-button";
import { CategoryFilterModal } from "@/features/transactions/components/category-filter-modal";
import { TransactionDayHeader } from "@/features/transactions/components/transaction-day-header";
import { TransactionMonthHeader } from "@/features/transactions/components/transaction-month-header";
import { TransactionRow } from "@/features/transactions/components/transaction-row";
import { TransactionSearchBar } from "@/features/transactions/components/transaction-search-bar";
import { TransactionSelectionBar } from "@/features/transactions/components/transaction-selection-bar";
import { useTransactionsInfinite } from "@/features/transactions/hooks/use-transactions-infinite";
import {
  getMonthlySpendTotalsCents,
  listCategoriesForTransactions,
} from "@/features/transactions/services/transactionsService";
import {
  buildFlatListFromTransactions,
  type TransactionListItem,
} from "@/features/transactions/utils";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function TransactionsScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );

  const categoryIds = useMemo(
    () => [...selectedCategories],
    [selectedCategories],
  );

  const filterParams = useMemo(
    () => ({
      search: deferredSearch.trim() || undefined,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    }),
    [deferredSearch, categoryIds],
  );

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "transactions-filter"],
    queryFn: listCategoriesForTransactions,
  });

  const { data: monthTotals = {} } = useQuery({
    queryKey: [
      "transactions",
      "month-totals",
      filterParams.search ?? "",
      [...categoryIds].sort().join(","),
    ],
    queryFn: () => getMonthlySpendTotalsCents(filterParams),
  });

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactionsInfinite({
    search: deferredSearch,
    categoryIds,
  });

  const flatData = useMemo(() => {
    const rows = data?.pages.flatMap((p) => p.rows) ?? [];
    return buildFlatListFromTransactions(rows, monthTotals);
  }, [data?.pages, monthTotals]);

  const emptyMessage = useMemo(() => {
    const hasSearch = deferredSearch.trim().length > 0;
    const hasCat = selectedCategories.size > 0;
    if (hasSearch && hasCat) {
      return "No transactions match your search and filters";
    }
    if (hasSearch) {
      return `No transactions matching "${deferredSearch.trim()}"`;
    }
    if (hasCat) {
      return "No transactions in selected categories";
    }
    return "Your transactions will appear here";
  }, [deferredSearch, selectedCategories.size]);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleClearCategories = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const openNewTransaction = useCallback(() => {
    router.push("/transaction");
  }, [router]);

  const openTransaction = useCallback(
    (id: string) => {
      router.push({ pathname: "/transaction", params: { id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: TransactionListItem }) => {
      switch (item.type) {
        case "monthHeader":
          return (
            <TransactionMonthHeader
              label={item.label}
              monthSpendCents={item.monthSpendCents}
            />
          );
        case "dayHeader":
          return <TransactionDayHeader label={item.label} />;
        case "transaction":
          return (
            <TransactionRow
              transaction={item.transaction}
              onPress={() => openTransaction(item.transaction.id)}
            />
          );
        default:
          return null;
      }
    },
    [openTransaction],
  );

  const keyExtractor = useCallback((item: TransactionListItem) => item.key, []);

  const getItemType = useCallback((item: TransactionListItem) => item.type, []);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const listHeader = useMemo(
    () => <AddTransactionButton onPress={openNewTransaction} />,
    [openNewTransaction],
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.copilotCanvas },
      ]}
    >
      <TransactionSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
        activeFilterCount={selectedCategories.size}
        onFilterPress={() => setFilterOpen(true)}
      />

      {isPending ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={60} style={{ marginBottom: 8 }} />
          <LoadingSkeleton height={120} style={{ marginBottom: 8 }} />
          <LoadingSkeleton height={80} />
        </View>
      ) : isError ? (
        <EmptyState
          title="Error loading transactions"
          message="Please try again later"
        />
      ) : flatData.length === 0 ? (
        <View style={styles.emptyWrap}>
          <AddTransactionButton onPress={openNewTransaction} />
          <EmptyState title="No transactions" message={emptyMessage} />
        </View>
      ) : (
        <View style={styles.listOuter}>
          <FlashList<TransactionListItem>
            style={styles.flashList}
            data={flatData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemType={getItemType}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            ListHeaderComponent={listHeader}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={theme.colors.tint} />
                </View>
              ) : null
            }
            contentContainerStyle={styles.flashContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <TransactionSelectionBar selectedCount={selectedCount} />

      <CategoryFilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        selectedIds={selectedCategories}
        onToggle={handleToggleCategory}
        onClear={handleClearCategories}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
  },
  emptyWrap: {
    flex: 1,
  },
  listOuter: {
    flex: 1,
    paddingHorizontal: 0,
  },
  flashList: {
    flex: 1,
  },
  flashContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  footer: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
}));
