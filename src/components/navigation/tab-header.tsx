import { type Href, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export interface TabRouteConfig {
  name: string;
  title: string;
  route: string;
}

/** Order matches primary navigation in the tab header (screenshot: horizontal pills). */
export const TAB_ROUTES: TabRouteConfig[] = [
  {
    name: "transactions",
    title: "Transactions",
    route: "/(tabs)/transactions",
  },
  { name: "dashboard", title: "Dashboard", route: "/(tabs)" },
  { name: "recurrings", title: "Recurrings", route: "/(tabs)/recurrings" },
  { name: "accounts", title: "Accounts", route: "/(tabs)/accounts" },
  { name: "investments", title: "Investments", route: "/(tabs)/investments" },
  { name: "savings", title: "Savings", route: "/(tabs)/savings" },
  { name: "cashflow", title: "Cash flow", route: "/(tabs)/cashflow" },
  { name: "budgets", title: "Budgets", route: "/(tabs)/budgets" },
];

function resolveTabName(pathname: string): string {
  const path = pathname.replace("/(tabs)", "").replace(/^\//, "");
  if (path === "" || path === "index") {
    return "dashboard";
  }
  const found = TAB_ROUTES.find((t) => t.name === path);
  return found?.name ?? "dashboard";
}

export interface TabHeaderProps {
  onSettingsPress?: () => void;
  onMessagesPress?: () => void;
}

export function TabHeader({
  onSettingsPress = () => undefined,
  onMessagesPress = () => undefined,
}: TabHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = resolveTabName(pathname);

  const handleTabPress = (route: string) => {
    router.push(route as Href);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={onSettingsPress}
          hitSlop={8}
          style={styles.sideButton}
        >
          <Text style={styles.icon}>⚙️</Text>
        </Pressable>
        <Text style={styles.title}>Copilot</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Messages"
          onPress={onMessagesPress}
          hitSlop={8}
          style={styles.sideButton}
        >
          <Text style={styles.icon}>💬</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {TAB_ROUTES.map((tab) => {
            const isActive = currentTab === tab.name;
            return (
              <Pressable
                key={tab.name}
                onPress={() => handleTabPress(tab.route)}
                style={styles.tab(isActive)}
              >
                <Text style={styles.tabText(isActive)}>{tab.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    backgroundColor: theme.colors.navy,
  },
  topRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.navy,
  },
  sideButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  title: {
    color: theme.colors.textOnNavy,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  tabsRow: {
    paddingBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  tab: (isActive: boolean) => ({
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: isActive ? theme.colors.textOnNavy : "transparent",
    alignItems: "center",
    justifyContent: "center",
  }),
  tabText: (isActive: boolean) => ({
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: -0.2,
    color: isActive ? theme.colors.navy : theme.colors.textOnNavy,
  }),
}));
