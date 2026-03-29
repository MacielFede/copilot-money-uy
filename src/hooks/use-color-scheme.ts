import { useUnistyles } from "react-native-unistyles";

/** Resolves to light or dark for Unistyles adaptive themes. */
export function useColorScheme(): "light" | "dark" {
  const { rt } = useUnistyles();
  return rt.colorScheme === "dark" ? "dark" : "light";
}
