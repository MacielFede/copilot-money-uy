import { View, Text, ScrollView, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { MoneyText, formatMoney, formatPercent } from "@/components/ui/money-text";
import { LoadingSkeleton, LoadingCard } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getActiveGoals, getReadyToSpendGoals, getTotalSaved, getTotalTarget } from '@/features/savings/services/savingsService';

export default function SavingsScreen() {
  const { theme } = useUnistyles();

  // Queries
  const { data: activeGoals, isLoading: activeLoading } = useQuery({
    queryKey: ['savings', 'active'],
    queryFn: getActiveGoals,
  });

  const { data: readyGoals, isLoading: readyLoading } = useQuery({
    queryKey: ['savings', 'ready'],
    queryFn: getReadyToSpendGoals,
  });

  const { data: totalSaved, isLoading: savedLoading } = useQuery({
    queryKey: ['savings', 'totalSaved'],
    queryFn: getTotalSaved,
  });

  const { data: totalTarget, isLoading: targetLoading } = useQuery({
    queryKey: ['savings', 'totalTarget'],
    queryFn: getTotalTarget,
  });

  const isLoading = activeLoading || readyLoading || savedLoading || targetLoading;

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
          {/* Goals Header Card */}
          <Card variant="elevated" style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.headerLabel, { color: theme.colors.textSecondary }]}>
                  Total Saved
                </Text>
                <MoneyText 
                  amount={totalSaved ?? 0} 
                  style={[styles.headerAmount, { color: theme.colors.text }]} 
                />
              </View>
              <View style={styles.headerDivider} />
              <View>
                <Text style={[styles.headerLabel, { color: theme.colors.textSecondary }]}>
                  Total Target
                </Text>
                <MoneyText 
                  amount={totalTarget ?? 0} 
                  style={[styles.headerAmount, { color: theme.colors.text }]} 
                />
              </View>
            </View>
            
            {/* Progress bar */}
            {totalTarget !== undefined && totalTarget > 0 && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.backgroundSecondary }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: theme.colors.success,
                        width: `${Math.min(((totalSaved ?? 0) / totalTarget) * 100, 100)}%`
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                  {formatPercent(((totalSaved ?? 0) / totalTarget) * 100)} of goals
                </Text>
              </View>
            )}
          </Card>

          {/* Ready to Spend Section */}
          {readyGoals && readyGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Ready to Spend
              </Text>
              <Card variant="outlined" style={styles.readyCard}>
                {readyGoals.map((goal, index) => (
                  <View 
                    key={goal.id}
                    style={[
                      styles.goalRow,
                      index < readyGoals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
                    ]}
                  >
                    <View style={styles.goalLeft}>
                      <Text style={styles.goalEmoji}>{goal.emoji ?? '🎯'}</Text>
                      <View>
                        <Text style={[styles.goalName, { color: theme.colors.text }]}>
                          {goal.name}
                        </Text>
                        <Text style={[styles.goalTarget, { color: theme.colors.textSecondary }]}>
                          Target: {formatMoney(goal.targetAmount)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.goalRight}>
                      <MoneyText 
                        amount={goal.savedAmount ?? 0} 
                        style={{ color: theme.colors.success }} 
                      />
                      <Pressable style={[styles.spendButton, { backgroundColor: theme.colors.success }]}>
                        <Text style={styles.spendButtonText}>Spend</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Active Goals Section */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Active Goals
          </Text>
          
          {activeGoals && activeGoals.length > 0 ? (
            activeGoals.map((goal) => (
              <Pressable key={goal.id} style={styles.goalCardWrapper}>
                <Card variant="outlined" style={styles.goalCard}>
                  <View style={styles.goalCardHeader}>
                    <View style={styles.goalCardLeft}>
                      <Text style={styles.goalEmoji}>{goal.emoji ?? '🎯'}</Text>
                      <View>
                        <Text style={[styles.goalCardName, { color: theme.colors.text }]}>
                          {goal.name}
                        </Text>
                        {goal.targetMonth && (
                          <Text style={[styles.goalCardDate, { color: theme.colors.textSecondary }]}>
                            Target: {new Date(goal.targetMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!goal.isOnTrack && (
                      <View style={[styles.warningBadge, { backgroundColor: theme.colors.warningLight }]}>
                        <Text style={[styles.warningText, { color: theme.colors.warning }]}>Behind</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Progress */}
                  <View style={styles.goalProgressSection}>
                    <View style={styles.goalProgressHeader}>
                      <MoneyText 
                        amount={goal.savedAmount ?? 0} 
                        variant="compact"
                        style={{ color: theme.colors.text }} 
                      />
                      <Text style={[styles.goalTargetText, { color: theme.colors.textSecondary }]}>
                        of {formatMoney(goal.targetAmount)}
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.backgroundSecondary }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            backgroundColor: goal.isOnTrack ? theme.colors.success : theme.colors.warning,
                            width: `${Math.min(goal.progress, 100)}%`
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  {/* Add money button */}
                  <Pressable style={[styles.addMoneyButton, { borderColor: theme.colors.tint }]}>
                    <Text style={[styles.addMoneyText, { color: theme.colors.tint }]}>
                      + Add Money
                    </Text>
                  </Pressable>
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState 
              title="No active goals"
              message="Create a savings goal to get started"
            />
          )}

          {/* Add Goal Button */}
          <Pressable style={[styles.addGoalButton, { backgroundColor: theme.colors.tint }]}>
            <Text style={styles.addGoalIcon}>+</Text>
            <Text style={styles.addGoalText}>Create New Goal</Text>
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
  headerCard: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerAmount: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  headerDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.divider,
  },
  progressContainer: {
    marginTop: theme.spacing.lg,
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
  progressLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  readyCard: {
    padding: 0,
    overflow: 'hidden',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  goalName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  goalTarget: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  goalRight: {
    alignItems: 'flex-end',
  },
  spendButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  spendButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  goalCardWrapper: {
    marginBottom: theme.spacing.md,
  },
  goalCard: {
    padding: theme.spacing.lg,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCardName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  goalCardDate: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  warningBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  warningText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  goalProgressSection: {
    marginBottom: theme.spacing.md,
  },
  goalProgressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  goalTargetText: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  addMoneyButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  addMoneyText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  addGoalIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: theme.spacing.sm,
  },
  addGoalText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: theme.spacing.xxxl,
  },
}) as any);