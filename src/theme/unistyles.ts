import { StyleSheet } from "react-native-unistyles";
import { darkTheme, lightTheme } from "./themes";

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});

export * from "./themes";
