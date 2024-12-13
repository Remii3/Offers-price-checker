import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { OfferType } from "../../../types/types";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type ResponseType = {
  offers: OfferType[];
  nextCursor: number;
};

export const FILTER_STATES = [
  { name: "Changed", value: "changed" },
  { name: "Not changed", value: "notChanged" },
  { name: "New", value: "new" },
];

export const SORT_STATES = [
  { name: "Oldest", value: "oldest" },
  { name: "Newest", value: "newest" },
];

export function useOffersList() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const router = useRouter();
  const initialFilter = searchParams.get("filter") || FILTER_STATES[0].value;
  const initialSort = searchParams.get("sort") || SORT_STATES[0].value;

  const [filtersState, setFiltersState] = useState(
    initialFilter || FILTER_STATES[0].value
  );
  const [sortState, setSortState] = useState(
    initialSort || SORT_STATES[0].value
  );
  const {
    data: offerPages,
    isFetching,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<ResponseType, Error>({
    queryKey: ["offers", sortState, filtersState],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get<ResponseType>(`/api/offers`, {
        params: {
          cursor: pageParam,
          userId: session ? session.user.id : "test",
          sort: sortState,
          filter: filtersState,
        },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    enabled: !!session,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const params = new URLSearchParams({
      filter: filtersState,
      sort: sortState,
    });
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [filtersState, sortState, router]);

  function changeFilterHandler(filter: string) {
    setFiltersState(filter);
  }

  function changeSortHandler(sort: string) {
    setSortState(sort);
  }

  async function refetchWithNewData() {
    if (!session) return;
    setIsRefreshingPrices(true);
    await axios.post(`/api/check-offers`, { userId: session.user.id });
    setIsRefreshingPrices(false);
    refetch();
  }

  return {
    offerPages,
    isLoading,
    isFetching,
    error,
    filtersState,
    changeFilterHandler,
    sortState,
    changeSortHandler,
    hasNextPage,
    fetchNextPage,
    refetchWithNewData,
    isRefreshingPrices,
  };
}
