import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xxxl,
  },
  iconWrap: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: -0.2,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
}));
