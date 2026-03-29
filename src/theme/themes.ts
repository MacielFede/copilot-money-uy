import { Platform } from "react-native";

// Legacy template Colors (align with Unistyles light theme)
const tintColorLight = "#2E6AD1";
const tintColorDark = "#5B94F0";

export const Colors = {
  light: {
    text: "#1C1C1E",
    background: "#F2F2F7",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#FFFFFF",
    background: "#000000",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Unistyles theme - using 'any' for type compatibility
export const lightTheme = {
  colors: {
    // Base — Copilot: grouped list canvas behind white cards
    background: "#F2F2F7",
    backgroundSecondary: "#FFFFFF",
    backgroundTertiary: "#E5E5EA",

    // Text — iOS-like hierarchy (Copilot reference)
    text: "#1C1C1E",
    textSecondary: "#8E8E93",
    textTertiary: "#AEAEB2",

    // Brand / interactive (header blue + links; ~Copilot screenshot)
    tint: "#2E6AD1",
    tintSecondary: "#2563C4",
    /** Top nav strip; active tab pill text */
    navy: "#2E6AD1",
    /** Icons + title on navy header */
    textOnNavy: "#FFFFFF",

    // Semantic colors
    success: "#34C759",
    successLight: "#E8F5E9",
    warning: "#FF9500",
    warningLight: "#FFF3E0",
    error: "#FF3B30",
    errorLight: "#FFE5E5",
    info: "#2E6AD1",
    infoLight: "#E8EEFB",

    // Card & Surface
    card: "#FFFFFF",
    cardBorder: "#E5E5EA",
    surface: "#F2F2F7",
    surfaceBorder: "#D1D1D6",

    // UI Elements
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#2E6AD1",

    // Utility
    border: "#D1D1D6",
    divider: "#E5E5EA",
    overlay: "rgba(0, 0, 0, 0.45)",

    /** Copilot transactions reference */
    copilotNavy: "#1A2B4C",
    copilotMuted: "#8A99AF",
    copilotCanvas: "#F4F7F9",
    copilotAccentBlue: "#3B82F6",
    categoryPillBg: "#F3E8FF",
    categoryPillText: "#9333EA",
    addButtonBorder: "#3B82F6",
    addButtonBg: "rgba(59, 130, 246, 0.12)",

    // Category colors
    categoryFood: "#FF9500",
    categoryTransport: "#007AFF",
    categoryShopping: "#AF52DE",
    categoryEntertainment: "#FF2D55",
    categoryBills: "#5856D6",
    categoryHealth: "#FF3B30",
    categoryIncome: "#34C759",
    categoryOther: "#8E8E93",
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  typography: {
    fontSize: {
      xxs: 10,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    } as const,
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    fontFamily: {
      // Will be overridden by Platform.select in actual use
      regular: "System",
      medium: "System",
      semibold: "System",
      bold: "System",
    },
  },
  /** Copilot-style soft card lift on light gray canvas */
  shadows: {
    sm: {
      shadowColor: "#1C1C1E",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: "#1C1C1E",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    lg: {
      shadowColor: "#1C1C1E",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

export const darkTheme: typeof lightTheme = {
  colors: {
    // Base
    background: "#000000",
    backgroundSecondary: "#1C1C1E",
    backgroundTertiary: "#2C2C2E",

    // Text
    text: "#FFFFFF",
    textSecondary: "#AEAEB2",
    textTertiary: "#8E8E93",

    // Brand — same family as light; links stay readable on dark
    tint: "#5B94F0",
    tintSecondary: "#7EB0F5",
    navy: "#2E6AD1",
    textOnNavy: "#FFFFFF",

    // Semantic
    success: "#30D158",
    successLight: "#1E3A2A",
    warning: "#FFD60A",
    warningLight: "#3D3300",
    error: "#FF453A",
    errorLight: "#3D1E1E",
    info: "#5B94F0",
    infoLight: "#1A2F4A",

    // Card & Surface
    card: "#1C1C1E",
    cardBorder: "#38383A",
    surface: "#1C1C1E",
    surfaceBorder: "#38383A",

    // UI Elements
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#5B94F0",

    // Utility
    border: "#38383A",
    divider: "#38383A",
    overlay: "rgba(0, 0, 0, 0.65)",

    copilotNavy: "#E8EEF9",
    copilotMuted: "#8E9AAF",
    copilotCanvas: "#000000",
    copilotAccentBlue: "#5B94F0",
    categoryPillBg: "#2C2438",
    categoryPillText: "#C4B5FD",
    addButtonBorder: "#5B94F0",
    addButtonBg: "rgba(91, 148, 240, 0.15)",

    // Category colors (brighter for dark mode)
    categoryFood: "#FFB340",
    categoryTransport: "#0A84FF",
    categoryShopping: "#BF5AF2",
    categoryEntertainment: "#FF375F",
    categoryBills: "#5E5CE6",
    categoryHealth: "#FF453A",
    categoryIncome: "#30D158",
    categoryOther: "#98989D",
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

/** Theme shape used by Unistyles and UI helpers. */
export type Theme = typeof lightTheme;
