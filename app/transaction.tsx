import { TransactionEditScreen } from "@/features/transactions/components/transaction-edit-screen";
import { useLocalSearchParams } from "expo-router";

export default function TransactionModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return <TransactionEditScreen transactionId={id} />;
}
