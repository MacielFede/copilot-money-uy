import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { MoneyText, formatMoney } from "@/components/ui/money-text";
import { LoadingSkeleton, LoadingCard } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { listRecurrings, getMonthlyRecurringTotal } from '@/features/recurrings/services/recurringsService';

export default function RecurringsScreen() {
  const { theme } = useUnistyles();

  // Queries
  const { data: recurrings, isLoading: recurringsLoading } = useQuery({
    queryKey: ['recurrings'],
    queryFn: listRecurrings,
  });

  const { data: monthlyTotal, isLoading: totalLoading } = useQuery({
    queryKey: ['recurrings', 'monthlyTotal'],
    queryFn: getMonthlyRecurringTotal,
  });

  const isLoading = recurringsLoading || totalLoading;

  // Calculate total for this month
  const totalThisMonth = recurrings?.reduce((sum, rec) => {
    if (rec.amountMin !== null && rec.amountMax !== null) {
      return sum + Math.round((rec.amountMin + rec.amountMax) / 2);
    }
    return sum + (rec.amountMin ?? 0);
  }, 0) ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LoadingCard />
          <LoadingSkeleton height={300} style={{ marginTop: 16 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Left to pay this month
              </Text>
              <MoneyText 
                amount={monthlyTotal ?? 0} 
                style={[styles.summaryAmount, { color: theme.colors.text }]} 
              />
            </View>
            
            {/* Donut Chart Placeholder */}
            <View style={[styles.donutContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <View style={[styles.donutChart, { borderColor: theme.colors.tint }]} />
              <Text style={[styles.donutLabel, { color: theme.colors.textSecondary }]}>
                Monthly recurring
              </Text>
            </View>
          </Card>

          {/* Grid of Recurrings */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Monthly Recurring
          </Text>
          
          {recurrings && recurrings.length > 0 ? (
            <View style={styles.grid}>
              {recurrings.map((recurring) => (
                <Pressable key={recurring.id} style={styles.gridItem}>
                  <Card variant="outlined" style={styles.recurringCard}>
                    <View style={styles.recurringHeader}>
                      <Text style={styles.emoji}>{recurring.emoji ?? '📦'}</Text>
                      <View style={[styles.checkCircle, { backgroundColor: theme.colors.success }]}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    </View>
                    <Text style={[styles.recurringName, { color: theme.colors.text }]} numberOfLines={1}>
                      {recurring.name}
                    </Text>
                    <Text style={[styles.recurringDate, { color: theme.colors.textSecondary }]}>
                      {recurring.nextPaymentDate 
                        ? new Date(recurring.nextPaymentDate).toLocaleDateString()
                        : 'Set up'}
                    </Text>
                    <MoneyText 
                      amount={recurring.amountMin ?? 0} 
                      variant="compact"
                      style={{ color: theme.colors.text }} 
                    />
                  </Card>
                </Pressable>
              ))}
              
              {/* Add New Card */}
              <Pressable style={styles.gridItem}>
                <Card variant="outlined" style={[styles.addCard, { borderStyle: 'dashed' }]}>
                  <Text style={styles.addIcon}>+</Text>
                  <Text style={[styles.addText, { color: theme.colors.tint }]}>
                    Add recurring
                  </Text>
                </Card>
              </Pressable>
            </View>
          ) : (
            <EmptyState 
              title="No recurrings"
              message="Set up your first recurring payment"
            />
          )}

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
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  donutContainer: {
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderStyle: 'solid',
  },
  donutLabel: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  gridItem: {
    width: '47%',
  },
  recurringCard: {
    padding: theme.spacing.md,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recurringName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 4,
  },
  recurringDate: {
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing.xs,
  },
  addCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  addIcon: {
    fontSize: 32,
    color: theme.colors.tint,
  },
  addText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  bottomPadding: {
    height: theme.spacing.xxxl,
  },
}) as any);