import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { OfferType } from "../../types/types";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FILTER_STATES, SORT_STATES } from "@/constants/constants";
import { useToast } from "@/hooks/use-toast";

type ResponseType = {
  offers: OfferType[];
  nextCursor: number;
  totalOffers: number;
};

export function useHome() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: session } = useSession();

  const router = useRouter();

  const filtersState = searchParams.get("filter") || FILTER_STATES[0].value;
  const sortState = searchParams.get("sort") || SORT_STATES[0].value;

  const [searchState, setSearchState] = useState(
    searchParams.get("search") || ""
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
          userId: session?.user.id,
          sort: sortState,
          filter: filtersState,
          search: searchState,
        },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    enabled: !!session?.user.id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { mutate: deleteAll, isPending: deleteAllIsLoading } = useMutation({
    mutationKey: ["deleteAllOffers"],
    mutationFn: async (userId: string) => {
      return await axios.delete(`/api/offers/delete-offers`, {
        params: { userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete all offers",
        variant: "destructive",
      });
      console.error("Error deleting all offers:", error);
    },
  });

  const { mutate: refreshOffers, isPending: refreshOffersIsLoading } =
    useMutation({
      mutationKey: ["refreshOffers"],
      mutationFn: async (userId: string) => {
        return await axios.post(`/api/check-offers`, { userId });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["offers"] });
      },
      onError: (error) => {
        toast({
          title: "Failed to refresh offers",
          variant: "destructive",
        });
        console.error("Error refreshing offers:", error);
      },
    });

  const changeUrlParams = useCallback(
    (name: string, value: string) => {
      const searchUrlValue = new URLSearchParams(searchParams.toString());

      if (value) {
        searchUrlValue.set(name, value);
      } else {
        searchUrlValue.delete(name);
      }

      router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  function changeFilterHandler(filter: string) {
    changeUrlParams("filter", filter);
  }

  function changeSortHandler(sort: string) {
    changeUrlParams("sort", sort);
  }

  function handleSearchChange(search: string) {
    setSearchState(search);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    changeUrlParams("search", searchState);
    refetch();
  }

  function handleRefreshOffers() {
    if (session?.user.id) {
      refreshOffers(session.user.id);
    }
  }

  function handleDeleteAllOffers() {
    if (session?.user.id) {
      deleteAll(session.user.id);
    }
  }

  useEffect(() => {
    if (!searchParams.get("sort")) {
      changeUrlParams("sort", SORT_STATES[0].value);
    }
    if (!searchParams.get("filter")) {
      changeUrlParams("filter", FILTER_STATES[0].value);
    }
  }, [changeUrlParams, searchParams]);

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
    handleSearch,
    search: searchState,
    refetch,
    handleSearchChange,
    handleRefreshOffers,
    refreshOffersIsLoading,
    handleDeleteAllOffers,
    deleteAllIsLoading,
  };
}
