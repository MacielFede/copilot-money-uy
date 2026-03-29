import React from "react";
import { View, type ViewProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import type { Theme } from "@/theme/themes";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
}

function variantStyle(theme: Theme, variant: NonNullable<CardProps["variant"]>) {
  const base = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  };
  switch (variant) {
    case "elevated":
      return {
        ...base,
        ...theme.shadows.md,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
      };
    case "outlined":
      return {
        ...base,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
      };
    default:
      return base;
  }
}

export function Card({
  variant = "default",
  style,
  children,
  ...props
}: CardProps) {
  const { theme } = useUnistyles();
  return (
    <View style={[variantStyle(theme as Theme, variant), style]} {...props}>
      {children}
    </View>
  );
}
