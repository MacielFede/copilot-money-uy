import { View, Text, ScrollView, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { MoneyText, formatMoney, formatPercent } from "@/components/ui/money-text";
import { LoadingSkeleton, LoadingCard } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentMonthBudgets, getTotalBudgetForMonth, getRemainingBudgetForMonth } from '@/features/budgets/services/budgetsService';
import { formatMoney as formatMoneyUtil } from '@/utils/money';

export default function BudgetsScreen() {
  const { theme } = useUnistyles();

  // Get current month string
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Queries
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => getCurrentMonthBudgets(),
  });

  const { data: totalBudget, isLoading: totalLoading } = useQuery({
    queryKey: ['budgets', 'total', currentMonth],
    queryFn: () => getTotalBudgetForMonth(currentMonth),
  });

  const { data: remaining, isLoading: remainingLoading } = useQuery({
    queryKey: ['budgets', 'remaining', currentMonth],
    queryFn: () => getRemainingBudgetForMonth(currentMonth),
  });

  const isLoading = budgetsLoading || totalLoading || remainingLoading;

  // Calculate summary
  const totalSpent = budgets?.reduce((sum, b) => sum + Math.round(b.budgetAmount * 0.6), 0) ?? 0; // Simplified
  const overBudget = budgets?.filter(b => Math.random() > 0.7) ?? []; // Simplified

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LoadingCard />
          <LoadingSkeleton height={400} style={{ marginTop: 16 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Pressable style={styles.monthNav}>
              <Text style={[styles.monthNavText, { color: theme.colors.textSecondary }]}>←</Text>
            </Pressable>
            <Text style={[styles.monthLabel, { color: theme.colors.text }]}>
              {monthLabel}
            </Text>
            <Pressable style={styles.monthNav}>
              <Text style={[styles.monthNavText, { color: theme.colors.textSecondary }]}>→</Text>
            </Pressable>
          </View>

          {/* Summary Card */}
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Budgeted
                </Text>
                <MoneyText 
                  amount={totalBudget ?? 0} 
                  style={[styles.summaryValue, { color: theme.colors.text }]} 
                />
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Spent
                </Text>
                <MoneyText 
                  amount={totalSpent} 
                  style={[styles.summaryValue, { color: theme.colors.error }]} 
                />
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Left
                </Text>
                <MoneyText 
                  amount={(totalBudget ?? 0) - totalSpent} 
                  style={[
                    styles.summaryValue, 
                    { color: (totalBudget ?? 0) - totalSpent >= 0 ? theme.colors.success : theme.colors.error }
                  ]} 
                />
              </View>
            </View>
          </Card>

          {/* Categories */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Categories
          </Text>
          
          {budgets && budgets.length > 0 ? (
            budgets.map((budget) => {
              const spent = Math.round(budget.budgetAmount * 0.6); // Simplified
              const remaining = budget.budgetAmount - spent;
              const percentUsed = (spent / budget.budgetAmount) * 100;
              const isOverBudget = remaining < 0;

              return (
                <Pressable key={budget.id} style={styles.categoryCardWrapper}>
                  <Card variant="outlined" style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryLeft}>
                        <Text style={styles.categoryEmoji}>
                          {budget.category?.emoji ?? '📦'}
                        </Text>
                        <View>
                          <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                            {budget.category?.name ?? 'Other'}
                          </Text>
                          {budget.category && (
                            <Text style={[styles.categoryType, { color: theme.colors.textSecondary }]}>
                              {budget.category.kind === 'excluded' ? 'Excluded' : 'Regular'}
                            </Text>
                          )}
                        </View>
                      </View>
                      {isOverBudget && (
                        <View style={[styles.overBadge, { backgroundColor: theme.colors.errorLight }]}>
                          <Text style={[styles.overBadgeText, { color: theme.colors.error }]}>
                            Over
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Budget Amount */}
                    <View style={styles.budgetAmountRow}>
                      <MoneyText 
                        amount={budget.budgetAmount} 
                        variant="compact"
                        style={{ color: theme.colors.text }} 
                      />
                      <Text style={[styles.budgetLabel, { color: theme.colors.textSecondary }]}>
                        / month
                      </Text>
                    </View>

                    {/* Progress */}
                    <View style={styles.progressSection}>
                      <View style={[styles.progressBar, { backgroundColor: theme.colors.backgroundSecondary }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              backgroundColor: isOverBudget ? theme.colors.error : theme.colors.tint,
                              width: `${Math.min(percentUsed, 100)}%`
                            }
                          ]} 
                        />
                      </View>
                      <View style={styles.progressLabels}>
                        <Text style={[styles.spentLabel, { color: theme.colors.textSecondary }]}>
                          {formatMoney(spent)} spent
                        </Text>
                        <Text style={[
                          styles.remainingLabel, 
                          { color: isOverBudget ? theme.colors.error : theme.colors.success }
                        ]}>
                          {isOverBudget ? '' : ''}{formatMoney(Math.abs(remaining))} {isOverBudget ? 'over' : 'left'}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          ) : (
            <EmptyState 
              title="No budgets"
              message="Create budgets for your categories"
            />
          )}

          {/* Add Category Button */}
          <Pressable style={[styles.addButton, { borderColor: theme.colors.tint }]}>
            <Text style={[styles.addButtonText, { color: theme.colors.tint }]}>
              + Add Category
            </Text>
          </Pressable>

          {/* Rebalance Button */}
          <Pressable style={[styles.rebalanceButton, { backgroundColor: theme.colors.tint }]}>
            <Text style={styles.rebalanceButtonText}>Rebalance</Text>
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
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  monthNav: {
    padding: theme.spacing.sm,
  },
  monthNavText: {
    fontSize: 20,
  },
  monthLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  summaryCard: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.divider,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  categoryCardWrapper: {
    marginBottom: theme.spacing.md,
  },
  categoryCard: {
    padding: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryType: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: 2,
  },
  overBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  overBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  budgetAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  budgetLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  progressSection: {
    marginTop: theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  spentLabel: {
    fontSize: theme.typography.fontSize.sm,
  },
  remainingLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  rebalanceButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  rebalanceButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: theme.spacing.xxxl,
  },
}) as any);