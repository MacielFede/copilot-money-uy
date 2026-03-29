import type { Theme } from "./src/theme/themes";

declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: Theme;
    dark: Theme;
  }
}
