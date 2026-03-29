import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { MoneyText, formatMoney, formatPercent } from "@/components/ui/money-text";
import { LoadingSkeleton, LoadingCard } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getInvestmentsWithHoldings, getTotalInvestmentValue, getInvestmentAllocation, type InvestmentWithHoldings } from '@/features/investments/services/investmentsService';

type FilterType = 'all' | 'stocks' | 'bonds' | 'etfs' | 'crypto';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'bonds', label: 'Bonds' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'crypto', label: 'Crypto' },
];

export default function InvestmentsScreen() {
  const { theme } = useUnistyles();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Queries
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: getInvestmentsWithHoldings,
  });

  const { data: totalValue, isLoading: totalLoading } = useQuery({
    queryKey: ['investments', 'total'],
    queryFn: getTotalInvestmentValue,
  });

  const { data: allocation, isLoading: allocationLoading } = useQuery({
    queryKey: ['investments', 'allocation'],
    queryFn: getInvestmentAllocation,
  });

  const isLoading = investmentsLoading || totalLoading || allocationLoading;

  // Filter investments
  const filteredInvestments = investments?.filter(inv => {
    if (activeFilter === 'all') return true;
    // Simplified filtering - would check holdings
    return true;
  }) ?? [];

  // Calculate total
  const displayTotal = investments?.reduce((sum, inv) => sum + inv.totalValue, 0) ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LoadingCard />
          <LoadingSkeleton height={200} style={{ marginTop: 16 }} />
          <LoadingSkeleton height={300} style={{ marginTop: 16 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Total Value Card */}
          <Card variant="elevated" style={styles.totalCard}>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
              Total Portfolio Value
            </Text>
            <MoneyText 
              amount={displayTotal} 
              style={[styles.totalAmount, { color: theme.colors.text }]} 
            />
            
            {/* Allocation breakdown */}
            {allocation && allocation.length > 0 && (
              <View style={styles.allocationRow}>
                {allocation.map((item, index) => (
                  <View key={item.groupName} style={styles.allocationItem}>
                    <View style={[styles.allocationDot, { backgroundColor: getAllocationColor(index) }]} />
                    <Text style={[styles.allocationLabel, { color: theme.colors.textSecondary }]}>
                      {item.groupName}
                    </Text>
                    <Text style={[styles.allocationValue, { color: theme.colors.text }]}>
                      {formatPercent(item.allocationPct)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Filter Pills */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {FILTERS.map((filter) => (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterPill,
                  activeFilter === filter.key 
                    ? { backgroundColor: theme.colors.tint }
                    : { backgroundColor: theme.colors.backgroundSecondary }
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={[
                  styles.filterText,
                  { color: activeFilter === filter.key ? '#FFFFFF' : theme.colors.textSecondary }
                ]}>
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Holdings */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Holdings
          </Text>
          
          {filteredInvestments.length > 0 ? (
            <Card variant="outlined" style={styles.holdingsCard}>
              {filteredInvestments.map((investment, invIndex) => (
                <View 
                  key={investment.id}
                  style={[
                    styles.holdingGroup,
                    invIndex < filteredInvestments.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
                  ]}
                >
                  <View style={styles.groupHeader}>
                    <Text style={[styles.groupName, { color: theme.colors.text }]}>
                      {investment.groupName}
                    </Text>
                    <View style={styles.groupValue}>
                      <MoneyText 
                        amount={investment.totalValue} 
                        variant="compact"
                        style={{ color: theme.colors.text }} 
                      />
                      <Text style={[styles.groupPercent, { color: theme.colors.textSecondary }]}>
                        {formatPercent(investment.allocationPct)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Individual holdings */}
                  {investment.holdings.map((holding, holdIndex) => (
                    <View 
                      key={holding.symbol}
                      style={[
                        styles.holdingRow,
                        holdIndex < investment.holdings.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }
                      ]}
                    >
                      <View style={styles.holdingInfo}>
                        <Text style={[styles.holdingSymbol, { color: theme.colors.text }]}>
                          {holding.symbol}
                        </Text>
                        <Text style={[styles.holdingName, { color: theme.colors.textSecondary }]}>
                          {holding.name}
                        </Text>
                      </View>
                      <MoneyText 
                        amount={holding.value} 
                        variant="compact"
                        style={{ color: theme.colors.text }} 
                      />
                    </View>
                  ))}
                </View>
              ))}
            </Card>
          ) : (
            <EmptyState 
              title="No investments"
              message="Add your first investment to get started"
            />
          )}

          {/* Add Investment Button */}
          <Pressable style={[styles.addButton, { backgroundColor: theme.colors.tint }]}>
            <Text style={styles.addButtonText}>+ Add Investment</Text>
          </Pressable>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

function getAllocationColor(index: number): string {
  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55'];
  return colors[index % colors.length];
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  totalCard: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  allocationRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  allocationLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  allocationValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterScroll: {
    marginTop: theme.spacing.lg,
    marginHorizontal: -theme.spacing.lg,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  holdingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  holdingGroup: {
    padding: theme.spacing.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  groupName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  groupValue: {
    alignItems: 'flex-end',
  },
  groupPercent: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: 2,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  holdingName: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: 2,
  },
  addButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: theme.spacing.xxxl,
  },
}) as any);