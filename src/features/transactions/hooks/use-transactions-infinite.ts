import {
  listTransactionsPage,
  type ListTransactionsPageParams,
  type TransactionCursor,
} from "@/features/transactions/services/transactionsService";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseTransactionsInfiniteArgs {
  search: string;
  categoryIds: string[];
  pageSize?: number;
}

export function useTransactionsInfinite({
  search,
  categoryIds,
  pageSize,
}: UseTransactionsInfiniteArgs) {
  const sortedCategoryKey = [...categoryIds].sort().join(",");

  return useInfiniteQuery({
    queryKey: [
      "transactions",
      "infinite",
      search,
      sortedCategoryKey,
      pageSize ?? 40,
    ],
    initialPageParam: undefined as TransactionCursor | undefined,
    queryFn: async ({ pageParam }) => {
      const params: ListTransactionsPageParams = {
        search: search.trim() || undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        pageSize,
        cursor: pageParam ?? null,
      };
      return listTransactionsPage(params);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
