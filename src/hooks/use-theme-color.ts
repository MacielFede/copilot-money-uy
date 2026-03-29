import { useUnistyles } from "react-native-unistyles";

type ThemeColorName = "text" | "background" | "tint" | "icon";

/**
 * Resolves a color from optional light/dark overrides, otherwise from the active Unistyles theme.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName
): string {
  const { theme, rt } = useUnistyles();
  const isDark = rt.colorScheme === "dark";
  if (isDark && props.dark !== undefined) return props.dark;
  if (!isDark && props.light !== undefined) return props.light;

  switch (colorName) {
    case "text":
      return theme.colors.text;
    case "background":
      return theme.colors.background;
    case "tint":
      return theme.colors.tint;
    case "icon":
      return theme.colors.tabIconDefault;
    default:
      return theme.colors.text;
  }
}
