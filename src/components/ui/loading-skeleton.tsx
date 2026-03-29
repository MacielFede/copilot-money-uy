import {
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function LoadingSkeleton({
  width = "100%",
  height = 20,
  borderRadius,
  style,
}: LoadingSkeletonProps) {
  return (
    <View
      style={[
        skeletonStyles.bar({
          width: width as DimensionValue,
          height,
          borderRadius: borderRadius ?? 4,
        }),
        style,
      ]}
    />
  );
}

const skeletonStyles = StyleSheet.create((theme) => ({
  bar: (opts: {
    width: DimensionValue;
    height: number;
    borderRadius: number;
  }) => ({
    opacity: 0.55,
    backgroundColor: theme.colors.backgroundTertiary,
    width: opts.width,
    height: opts.height,
    borderRadius: opts.borderRadius,
  }),
}));

export function LoadingCard() {
  return (
    <View style={cardStyles.card}>
      <LoadingSkeleton width={120} height={24} borderRadius={8} />
      <View style={cardStyles.cardRow}>
        <LoadingSkeleton width="60%" height={16} />
        <LoadingSkeleton width={80} height={16} />
      </View>
      <LoadingSkeleton height={60} borderRadius={12} />
    </View>
  );
}

const cardStyles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));
