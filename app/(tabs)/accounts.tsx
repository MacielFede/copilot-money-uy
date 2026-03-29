import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard, LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AccountRow } from "@/features/accounts/components/account-row";
import { AccountSectionHeader } from "@/features/accounts/components/account-section-header";
import { NetWorthChart } from "@/features/accounts/components/net-worth-chart";
import {
  computeAccountChangePercents,
  getAccountsGroupedByType,
  getNetWorth,
  listAccounts,
  listBalanceSnapshotDays,
  netWorthForSnapshotDay,
  type BalanceSnapshotDay,
} from "@/features/accounts/services/accountsService";
import {
  ACCOUNT_SECTION_ORDER,
  NET_WORTH_TIMEFRAME_DAYS,
  getSectionLabel,
  type AccountGroupKey,
  type NetWorthTimeframe,
} from "@/features/accounts/utils";
import type { Account } from "@/src/db/schema";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AccountListItem =
  | {
      kind: "header";
      key: string;
      sectionKey: AccountGroupKey;
      label: string;
      totalCents: number;
    }
  | {
      kind: "account";
      key: string;
      account: Account;
      changePercent: number;
    };

export default function AccountsScreen() {
  const [timeframe, setTimeframe] = useState<NetWorthTimeframe>("1M");

  const { data: grouped, isPending: groupedLoading } = useQuery({
    queryKey: ["accounts", "grouped"],
    queryFn: getAccountsGroupedByType,
  });

  const { data: history = [], isPending: historyLoading } = useQuery({
    queryKey: ["accounts", "balanceHistory"],
    queryFn: listBalanceSnapshotDays,
  });

  const { data: allAccounts = [], isPending: listLoading } = useQuery({
    queryKey: ["accounts", "list"],
    queryFn: listAccounts,
  });

  const { data: netWorthFallback = 0 } = useQuery({
    queryKey: ["accounts", "netWorth"],
    queryFn: getNetWorth,
  });

  const isLoading = groupedLoading || historyLoading || listLoading;

  const nwAccounts = useMemo(
    () => allAccounts.filter((a) => (a.isExcludedFromNetWorth ?? 0) === 0),
    [allAccounts],
  );

  const { netWorthSeries, displayNetWorth, chartChangePercent } =
    useMemo(() => {
      const maxDays = NET_WORTH_TIMEFRAME_DAYS[timeframe];
      const sliced: BalanceSnapshotDay[] =
        history.length > 0
          ? history.slice(-Math.min(maxDays, history.length))
          : [];

      if (sliced.length === 0) {
        const nw =
          nwAccounts.length > 0
            ? nwAccounts.reduce((s, a) => s + a.balance, 0)
            : netWorthFallback;
        return {
          netWorthSeries: [nw],
          displayNetWorth: nw,
          chartChangePercent: 0,
        };
      }

      const series = sliced.map((d) => netWorthForSnapshotDay(d, nwAccounts));
      const start = series[0] ?? 0;
      const end = series[series.length - 1] ?? 0;
      const chartChangePercent =
        start !== 0 ? ((end - start) / Math.abs(start)) * 100 : 0;

      return {
        netWorthSeries: series,
        displayNetWorth: end,
        chartChangePercent,
      };
    }, [timeframe, history, nwAccounts, netWorthFallback]);

  const changePercents = useMemo(
    () => computeAccountChangePercents(history, allAccounts),
    [history, allAccounts],
  );

  const listData = useMemo((): AccountListItem[] => {
    if (!grouped) return [];
    const items: AccountListItem[] = [];

    for (const key of ACCOUNT_SECTION_ORDER) {
      const sectionAccounts = grouped[key];
      if (!sectionAccounts?.length) continue;

      const sectionTotal = sectionAccounts.reduce((s, a) => s + a.balance, 0);
      const displayTotal =
        key === "credit_cards" || key === "loan" ? -sectionTotal : sectionTotal;

      items.push({
        kind: "header",
        key: `h-${key}`,
        sectionKey: key,
        label: getSectionLabel(key),
        totalCents: displayTotal,
      });

      for (const account of sectionAccounts) {
        items.push({
          kind: "account",
          key: account.id,
          account,
          changePercent: changePercents[account.id] ?? 0,
        });
      }
    }

    return items;
  }, [grouped, changePercents]);

  const totalAccounts = useMemo(() => {
    if (!grouped) return 0;
    return ACCOUNT_SECTION_ORDER.reduce(
      (n, k) => n + (grouped[k]?.length ?? 0),
      0,
    );
  }, [grouped]);

  const renderItem = useCallback(({ item }: { item: AccountListItem }) => {
    if (item.kind === "header") {
      return (
        <AccountSectionHeader label={item.label} totalCents={item.totalCents} />
      );
    }
    return (
      <AccountRow account={item.account} changePercent={item.changePercent} />
    );
  }, []);

  const keyExtractor = useCallback((item: AccountListItem) => item.key, []);

  const getItemType = useCallback((item: AccountListItem) => item.kind, []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <View style={styles.blueStrip} />
        <NetWorthChart
          netWorthCents={displayNetWorth}
          changePercent={chartChangePercent}
          seriesCents={netWorthSeries}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </View>
    ),
    [displayNetWorth, chartChangePercent, netWorthSeries, timeframe],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <LoadingCard />
          <LoadingSkeleton height={200} style={styles.loadingSkeletonGap} />
          <LoadingSkeleton height={150} style={styles.loadingSkeletonGap} />
        </View>
      </View>
    );
  }

  if (!grouped || totalAccounts === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {ListHeader}
          <EmptyState
            title="No accounts"
            message="Add your first account to get started"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList<AccountListItem>
        style={styles.flashList}
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.flashContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingSkeletonGap: {
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  headerBlock: {
    marginBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  blueStrip: {
    position: "absolute",
    top: 0,
    left: -theme.spacing.lg,
    right: -theme.spacing.lg,
    height: 28,
    backgroundColor: theme.colors.navy,
  },
  settingsButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: 0,
    padding: theme.spacing.xs,
    zIndex: 2,
  },
  settingsIcon: {
    fontSize: 20,
  },
  flashList: {
    flex: 1,
  },
  flashContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
}));
