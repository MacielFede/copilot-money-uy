import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { runSeedIfEmpty } from "@/src/db/seed";
import { QueryProvider } from "@/src/providers/query-provider";
export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initDatabase() {
      try {
        // Try to seed if empty (will skip if already seeded)
        await runSeedIfEmpty();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setIsReady(true); // Continue anyway to show UI
      }
    }
    initDatabase();
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <QueryProvider>
      <RootLayoutNav />
    </QueryProvider>
  );
}
