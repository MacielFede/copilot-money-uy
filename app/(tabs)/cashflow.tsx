import { View, Text, ScrollView, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { MoneyText, formatMoney, formatPercent } from "@/components/ui/money-text";
import { LoadingSkeleton, LoadingCard } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getCashflowHistory, getCashflowSummary } from '@/features/cashflow/services/cashflowService';

export default function CashflowScreen() {
  const { theme } = useUnistyles();

  // Queries
  const { data: cashflowHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['cashflow', 'history'],
    queryFn: () => getCashflowHistory(6),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['cashflow', 'summary'],
    queryFn: getCashflowSummary,
  });

  const isLoading = historyLoading || summaryLoading;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LoadingCard />
          <LoadingSkeleton height={200} style={{ marginTop: 16 }} />
          <LoadingSkeleton height={200} style={{ marginTop: 16 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Net Income
              </Text>
              <MoneyText 
                amount={summary?.totalNetIncome ?? 0} 
                style={[styles.summaryAmount, { 
                  color: (summary?.totalNetIncome ?? 0) >= 0 ? theme.colors.success : theme.colors.error 
                }]} 
              />
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>
                  Income
                </Text>
                <MoneyText 
                  amount={summary?.totalIncome ?? 0} 
                  style={[styles.itemValue, { color: theme.colors.success }]} 
                />
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>
                  Spend
                </Text>
                <MoneyText 
                  amount={summary?.totalSpend ?? 0} 
                  style={[styles.itemValue, { color: theme.colors.error }]} 
                />
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>
                  Excluded
                </Text>
                <MoneyText 
                  amount={summary?.totalExcluded ?? 0} 
                  style={[styles.itemValue, { color: theme.colors.textSecondary }]} 
                />
              </View>
            </View>
          </Card>

          {/* Chart Placeholder */}
          <Card variant="outlined" style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Income vs Spend
            </Text>
            <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <Text style={[styles.chartPlaceholderText, { color: theme.colors.textTertiary }]}>
                Chart visualization would go here
              </Text>
            </View>
          </Card>

          {/* Monthly Breakdown */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Monthly Breakdown
          </Text>
          
          {cashflowHistory && cashflowHistory.length > 0 ? (
            <Card variant="outlined" style={styles.breakdownCard}>
              {cashflowHistory.map((month, index) => (
                <View 
                  key={month.month}
                  style={[
                    styles.monthRow,
                    index < cashflowHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
                  ]}
                >
                  <View style={styles.monthInfo}>
                    <Text style={[styles.monthLabel, { color: theme.colors.text }]}>
                      {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    </Text>
                    {month.trend !== 0 && (
                      <Text style={[
                        styles.trendBadge,
                        { color: month.trend > 0 ? theme.colors.error : theme.colors.success }
                      ]}>
                        {month.trend > 0 ? '+' : ''}{formatPercent(month.trend)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.monthValues}>
                    <View style={styles.valueItem}>
                      <Text style={[styles.valueLabel, { color: theme.colors.textSecondary }]}>Income</Text>
                      <MoneyText 
                        amount={month.income} 
                        variant="compact"
                        style={{ color: theme.colors.success }} 
                      />
                    </View>
                    <View style={styles.valueItem}>
                      <Text style={[styles.valueLabel, { color: theme.colors.textSecondary }]}>Spend</Text>
                      <MoneyText 
                        amount={month.spend} 
                        variant="compact"
                        style={{ color: theme.colors.error }} 
                      />
                    </View>
                    <View style={styles.valueItem}>
                      <Text style={[styles.valueLabel, { color: theme.colors.textSecondary }]}>Net</Text>
                      <MoneyText 
                        amount={month.netIncome} 
                        variant="compact"
                        style={{ color: theme.colors.text }} 
                      />
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          ) : (
            <EmptyState 
              title="No cashflow data"
              message="Your cashflow will appear here"
            />
          )}

          {/* Net Income Modal Button */}
          <Pressable style={[styles.detailsButton, { backgroundColor: theme.colors.tint }]}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </Pressable>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  summaryCard: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  summaryAmount: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  itemValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  chartCard: {
    marginTop: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  chartPlaceholder: {
    height: 150,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: theme.typography.fontSize.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  breakdownCard: {
    padding: 0,
    overflow: 'hidden',
  },
  monthRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  monthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  monthLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  trendBadge: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  monthValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueItem: {
    alignItems: 'flex-start',
  },
  valueLabel: {
    fontSize: theme.typography.fontSize.xs,
    marginBottom: 2,
  },
  detailsButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  detailsButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: theme.spacing.xxxl,
  },
}) as any);