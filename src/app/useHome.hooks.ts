"use client";
import debounce from "lodash.debounce";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { OfferType } from "../../types/types";
import { useCallback, useEffect, useMemo, useState } from "react";
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

  const [filtersState, setFiltersState] = useState(FILTER_STATES[0].value);
  const [sortState, setSortState] = useState(SORT_STATES[0].value);

  const [searchState, setSearchState] = useState(
    searchParams.get("search") || ""
  );

  const {
    data: offerPages,
    isFetching,
    isLoading,
    error: offerPagesError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<ResponseType, Error>({
    queryKey: ["offers"],
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
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
  });

  const { mutate: deleteAll, isPending: deleteAllIsLoading } = useMutation({
    mutationKey: ["deleteAllOffers"],
    mutationFn: async (userId: string) => {
      return await axios.delete(`/api/offers`, {
        data: { userId, filtersState },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["offers"] });
      await queryClient.refetchQueries({ queryKey: ["offers"] });

      toast({ title: "Success", description: "All offers deleted." });
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
      mutationFn: async ({
        userEmail,
        userId,
      }: {
        userId: string;
        userEmail: string;
      }) => {
        return await axios.post(`/api/check-offers`, { userId, userEmail });
      },
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        queryClient.removeQueries({ queryKey: ["offers"] });

        toast({ title: "Success", description: "Offers refreshed." });
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
    localStorage.setItem("filter", filter);
  }

  function changeSortHandler(sort: string) {
    changeUrlParams("sort", sort);
    localStorage.setItem("sort", sort);
  }

  const debouncedSearch = useMemo(
    () =>
      debounce((search) => {
        changeUrlParams("search", search);
        queryClient.invalidateQueries({ queryKey: ["offers"] });
      }, 700),
    [changeUrlParams, queryClient]
  );

  function handleSearchChange(search: string) {
    setSearchState(search);
    debouncedSearch(search);
  }

  function handleRefreshOffers() {
    if (session?.user.id && session?.user.email) {
      refreshOffers({ userId: session.user.id, userEmail: session.user.email });
    }
  }

  function handleDeleteAllOffers() {
    if (session?.user.id) {
      deleteAll(session.user.id);
    }
  }

  useEffect(() => {
    if (!searchParams.get("sort")) {
      changeUrlParams(
        "sort",
        localStorage.getItem("sort") || SORT_STATES[0].value
      );
    }
    if (!searchParams.get("filter")) {
      changeUrlParams(
        "filter",
        localStorage.getItem("filter") || FILTER_STATES[0].value
      );
    }
  }, [changeUrlParams, searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFiltersState(
        searchParams.get("filter") ||
          localStorage.getItem("filter") ||
          FILTER_STATES[0].value
      );
      setSortState(
        searchParams.get("sort") ||
          localStorage.getItem("sort") ||
          SORT_STATES[0].value
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (offerPagesError) {
      toast({
        title: "Failed to fetch offers",
        description: offerPagesError.message || "Something went wrong.",
        variant: "destructive",
      });
      console.error("Error fetching offers:", offerPagesError);
    }
  }, [offerPagesError, toast]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["offers"] });
  }, [sortState, filtersState, queryClient]);

  return {
    offerPages,
    offerPagesIsLoading:
      isLoading || isFetching || refreshOffersIsLoading || deleteAllIsLoading,
    offerPagesError,
    filtersState,
    changeFilterHandler,
    sortState,
    changeSortHandler,
    hasNextPage,
    fetchNextPage,
    handleSearchChange,
    search: searchState,
    handleRefreshOffers,
    refreshOffersIsLoading,
    handleDeleteAllOffers,
    deleteAllIsLoading,
  };
}
