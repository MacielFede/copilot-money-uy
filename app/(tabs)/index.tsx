import { LoadingCard } from "@/components/ui/loading-skeleton";
import { BudgetScroll } from "@/features/dashboard/components/budget-scroll";
import { ReviewCard } from "@/features/dashboard/components/review-card";
import { SpendingChart } from "@/features/dashboard/components/spending-chart";
import { UpcomingRecurrings } from "@/features/dashboard/components/upcoming-recurrings";
import {
  getBudgetSummaries,
  getSpendingChartData,
  getToReviewTransactions,
  getUpcomingRecurrings,
} from "@/features/dashboard/services/dashboardService";
import { groupToReviewByDay } from "@/features/dashboard/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function DashboardScreen() {
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard", "spendingChart"],
    queryFn: getSpendingChartData,
    refetchOnWindowFocus: true,
  });

  const { data: toReview = [], isLoading: reviewLoading } = useQuery({
    queryKey: ["dashboard", "toReview"],
    queryFn: getToReviewTransactions,
  });

  const { data: recurrings = [], isLoading: recurringsLoading } = useQuery({
    queryKey: ["dashboard", "recurrings"],
    queryFn: getUpcomingRecurrings,
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ["dashboard", "budgets"],
    queryFn: getBudgetSummaries,
  });

  const dayGroups = useMemo(() => groupToReviewByDay(toReview, 3), [toReview]);

  const isLoading =
    chartLoading || reviewLoading || recurringsLoading || budgetsLoading;

  return (
    <View style={styles.container}>
      <View style={styles.blueStrip} />

      {isLoading || !chartData ? (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.loadingContent}
        >
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SpendingChart data={chartData} />
          <ReviewCard dayGroups={dayGroups} />
          <BudgetScroll budgets={budgets} />
          <UpcomingRecurrings items={recurrings} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  blueStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: theme.colors.navy,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  loadingContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
}));
