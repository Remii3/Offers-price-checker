import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { OfferType } from "../../../types/types";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type ResponseType = {
  offers: OfferType[];
  nextCursor: number;
  totalOffers: number;
};

export const FILTER_STATES = [
  { name: "Changed", value: "changed" },
  { name: "Not changed", value: "notChanged" },
  { name: "New", value: "new" },
  { name: "Deleted", value: "deleted" },
];

export const SORT_STATES = [
  { name: "Oldest", value: "oldest" },
  { name: "Newest", value: "newest" },
];

export function useOffersList() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
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
          userId: session && session.user.id,
          sort: sortState,
          filter: filtersState,
          search,
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

  const {
    mutate: deleteAll,
    isPending: deleteAllIsPending,
    error: deleteAllError,
  } = useMutation({
    mutationKey: ["deleteAllOffers"],
    mutationFn: async () => {
      if (!session) return;
      await axios.delete(`/api/offers/delete-offers`, {
        params: { userId: session.user.id },
      });
    },
  });

  function changeFilterHandler(filter: string) {
    setFiltersState(filter);
    const searchUrlValue = new URLSearchParams(window.location.search);

    if (filter) {
      searchUrlValue.set("filter", filter);
    } else {
      searchUrlValue.delete("filter");
    }

    router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
  }

  function changeSortHandler(sort: string) {
    setSortState(sort);
    const searchUrlValue = new URLSearchParams(window.location.search);

    if (sort) {
      searchUrlValue.set("sort", sort);
    } else {
      searchUrlValue.delete("sort");
    }

    router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
  }

  function handleSearchChange(data: string) {
    setSearch(data);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const searchUrlValue = new URLSearchParams(window.location.search);

    if (search) {
      searchUrlValue.set("search", search);
    } else {
      searchUrlValue.delete("search");
    }

    router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
    refetch();
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
    handleSearch,
    search,
    refetch,
    handleSearchChange,
    deleteAll,
    deleteAllIsPending,
    deleteAllError,
  };
}
