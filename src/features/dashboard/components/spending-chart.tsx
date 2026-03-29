import type { SpendingChartData } from "@/features/dashboard/services/dashboardService";
import { formatMoney } from "@/utils/money";
import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const CHART_HEIGHT = 88;
const V_PAD = 8;

export interface SpendingChartProps {
  data: SpendingChartData;
}

function formatWholeDollars(cents: number): string {
  const n = Math.round(Math.abs(cents) / 100);
  return `$${n.toLocaleString("en-US")}`;
}

export function SpendingChart({ data }: SpendingChartProps) {
  const { theme } = useUnistyles();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(160, screenWidth - 64);

  const {
    thisMonthTotalCents,
    lastMonthTotalCents,
    daysInMonth,
    todayDay,
    cumulativeCentsByDay,
  } = data;

  const maxValue = Math.max(
    thisMonthTotalCents,
    lastMonthTotalCents,
    1,
  );

  const denom = Math.max(daysInMonth - 1, 1);

  const toY = (valueCents: number) =>
    V_PAD + (1 - valueCents / maxValue) * (CHART_HEIGHT - V_PAD * 2);

  const actualPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < cumulativeCentsByDay.length; i++) {
      const cum = cumulativeCentsByDay[i] ?? 0;
      const x = (i / denom) * chartWidth;
      const y =
        V_PAD +
        (1 - cum / maxValue) * (CHART_HEIGHT - V_PAD * 2);
      pts.push({ x, y });
    }
    return pts;
  }, [cumulativeCentsByDay, chartWidth, maxValue, denom]);

  const actualPath = useMemo(() => {
    if (actualPoints.length === 0) return "";
    const [first, ...rest] = actualPoints;
    return (
      `M ${first.x} ${first.y}` + rest.map((p) => ` L ${p.x} ${p.y}`).join("")
    );
  }, [actualPoints]);

  const lastPoint = actualPoints[actualPoints.length - 1];

  const baselineY1 = toY(0);
  const baselineY2 = toY(lastMonthTotalCents);

  const expectedTodayCents =
    (lastMonthTotalCents * todayDay) / Math.max(daysInMonth, 1);
  const diffCents = expectedTodayCents - thisMonthTotalCents;
  const isUnder = diffCents >= 0;
  const accentColor = isUnder ? theme.colors.success : theme.colors.error;
  const pillLabel = `${formatMoney(Math.abs(diffCents))} ${isUnder ? "under" : "over"}`;

  const pillLeft = lastPoint
    ? Math.min(lastPoint.x + 4, chartWidth - 96)
    : 0;
  const pillTop = lastPoint ? Math.max(4, lastPoint.y - 26) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.amountLabel}>
        {formatWholeDollars(thisMonthTotalCents)} spent
      </Text>
      <Text style={styles.subtitle}>
        {formatWholeDollars(lastMonthTotalCents)} spent last month
      </Text>

      <View style={styles.chartWrap}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Line
            x1={0}
            y1={baselineY1}
            x2={chartWidth}
            y2={baselineY2}
            stroke={theme.colors.textTertiary}
            strokeWidth={1.5}
            strokeDasharray="5,4"
          />
          {actualPath ? (
            <Path
              d={actualPath}
              stroke={accentColor}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {lastPoint ? (
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={4}
              fill={accentColor}
            />
          ) : null}
        </Svg>

        {lastPoint ? (
          <View
            style={[
              styles.pill,
              { backgroundColor: accentColor, left: pillLeft, top: pillTop },
            ]}
          >
            <Text style={styles.pillText}>{pillLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  amountLabel: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xxs,
    textAlign: "center",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
  chartWrap: {
    height: CHART_HEIGHT,
    position: "relative",
  },
  pill: {
    position: "absolute",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: "#FFFFFF",
  },
}));
