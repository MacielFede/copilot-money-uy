import type { Theme } from "@/theme/themes";
import { formatAbsoluteMoney, formatMoney } from "@/utils/money";
import { Text, type TextProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

interface MoneyTextProps extends Omit<TextProps, "children"> {
  amount: number;
  variant?: "default" | "signed" | "compact" | "absolute";
  showCents?: boolean;
  color?: "default" | "positive" | "negative" | "muted";
}

export function MoneyText({
  amount,
  variant = "default",
  showCents = true,
  color = "default",
  style,
  ...props
}: MoneyTextProps) {
  const { theme } = useUnistyles();
  const t = theme as Theme;

  const formatted =
    variant === "compact"
      ? formatAbsoluteMoney(amount, false)
      : formatAbsoluteMoney(amount, showCents);

  const textColor = (() => {
    switch (color) {
      case "positive":
        return amount >= 0 ? t.colors.success : t.colors.error;
      case "negative":
        return amount < 0 ? t.colors.error : t.colors.text;
      case "muted":
        return t.colors.textSecondary;
      default:
        return t.colors.text;
    }
  })();

  return (
    <Text style={[{ color: textColor }, style]} {...props}>
      {formatted}
    </Text>
  );
}

export {
  formatAbsoluteMoney,
  formatMoney,
  formatSignedMoney,
  formatCompactMoney,
  formatPercent,
} from "@/utils/money";
