import { Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface TransactionSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  activeFilterCount: number;
  onFilterPress: () => void;
}

export function TransactionSearchBar({
  value,
  onChangeText,
  onClear,
  activeFilterCount,
  onFilterPress,
}: TransactionSearchBarProps) {
  const { theme } = useUnistyles();
  const hasFilter = activeFilterCount > 0;

  styles.useVariants({
    filterState: hasFilter ? "active" : "inactive",
  });

  return (
    <View style={styles.searchContainer}>
      <View style={styles.blueStrip} />
      <View style={styles.searchInputWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Text style={styles.clearButton}>✕</Text>
          </Pressable>
        )}
        <Pressable onPress={onFilterPress} style={styles.filterBtn} hitSlop={8}>
          <Text style={styles.filterIcon}>⊟</Text>
          {hasFilter && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    paddingVertical: 0,
    color: theme.colors.text,
  },
  clearButton: {
    fontSize: 16,
    padding: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  filterBtn: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
    position: "relative",
  },
  filterIcon: {
    fontSize: 18,
    variants: {
      filterState: {
        active: {
          color: theme.colors.tint,
        },
        inactive: {
          color: theme.colors.textSecondary,
        },
      },
    },
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: theme.colors.tint,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnNavy,
  },
  blueStrip: {
    position: "absolute",
    top: 0,
    left: -theme.spacing.lg,
    right: -theme.spacing.lg,
    height: 28,
    backgroundColor: theme.colors.navy,
  },
}));
