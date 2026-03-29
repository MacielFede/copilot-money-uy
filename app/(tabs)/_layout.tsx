import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

import { TabHeader } from "@/src/components/navigation/tab-header";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <TabHeader />
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          <Tabs.Screen
            name="transactions"
            options={{ title: "Transactions" }}
          />
          <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
          <Tabs.Screen name="recurrings" options={{ title: "Recurrings" }} />
          <Tabs.Screen name="accounts" options={{ title: "Accounts" }} />
          <Tabs.Screen name="investments" options={{ title: "Investments" }} />
          <Tabs.Screen name="savings" options={{ title: "Savings" }} />
          <Tabs.Screen name="cashflow" options={{ title: "Cash Flow" }} />
          <Tabs.Screen
            name="budgets"
            options={{ title: "Budgets", href: null }}
          />
        </Tabs>
      </View>
    </View>
  );
}
