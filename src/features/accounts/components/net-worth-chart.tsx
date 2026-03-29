import { MoneyText } from "@/components/ui/money-text";
import type { NetWorthTimeframe } from "@/features/accounts/utils";
import { NET_WORTH_TIMEFRAMES } from "@/features/accounts/utils";
import { useMemo } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const CHART_HEIGHT = 120;

export interface NetWorthChartProps {
  netWorthCents: number;
  changePercent: number;
  seriesCents: number[];
  timeframe: NetWorthTimeframe;
  onTimeframeChange: (t: NetWorthTimeframe) => void;
}

export function NetWorthChart({
  netWorthCents,
  changePercent,
  seriesCents,
  timeframe,
  onTimeframeChange,
}: NetWorthChartProps) {
  const { theme } = useUnistyles();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(200, screenWidth - theme.spacing.lg * 4);

  const isPositive = changePercent >= 0;
  const changeArrow = isPositive ? "↗" : "↘";
  const lineColor = isPositive ? theme.colors.success : theme.colors.error;

  const lineData = useMemo(() => {
    const raw = seriesCents.map((v) => ({ value: v }));
    if (raw.length === 0) {
      return [{ value: 0 }, { value: 0 }];
    }
    if (raw.length === 1) {
      return [raw[0], raw[0]];
    }
    return raw;
  }, [seriesCents]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Net worth</Text>
      <MoneyText amount={netWorthCents} style={styles.value} />

      <View style={styles.changePill(isPositive)}>
        <Text style={styles.changeText(isPositive)}>
          {changeArrow} {Math.abs(changePercent).toFixed(2)}%
        </Text>
      </View>

      <View style={styles.chartWrap}>
        <LineChart
          data={lineData}
          width={chartWidth}
          height={CHART_HEIGHT}
          adjustToWidth
          disableScroll
          initialSpacing={0}
          endSpacing={0}
          hideRules
          hideYAxisText
          hideDataPoints
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisColor="transparent"
          xAxisColor="transparent"
          gradientDirection="vertical"
          areaChart
          startOpacity={0.2}
          endOpacity={0}
          startFillColor={lineColor}
          endFillColor={lineColor}
          color={lineColor}
          thickness={2}
          curved
        />
      </View>
      <View style={styles.timeframeRow}>
        {NET_WORTH_TIMEFRAMES.map((tf) => (
          <Pressable
            key={tf}
            onPress={() => onTimeframeChange(tf)}
            style={styles.tfBtn(tf === timeframe)}
          >
            <Text style={styles.tfText(tf === timeframe)}>{tf}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: "center",
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
  },
  changePill: (positive: boolean) => ({
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: positive
      ? theme.colors.successLight
      : theme.colors.errorLight,
  }),
  changeText: (positive: boolean) => ({
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: positive ? theme.colors.success : theme.colors.error,
  }),
  timeframeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  tfBtn: (selected: boolean) => ({
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    minWidth: 36,
    alignItems: "center",
    backgroundColor: selected ? theme.colors.backgroundTertiary : "transparent",
  }),
  tfText: (selected: boolean) => ({
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: selected ? theme.colors.text : theme.colors.textSecondary,
  }),
  chartWrap: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
}));
