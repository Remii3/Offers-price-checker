"use client";
import debounce from "lodash.debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { OfferType } from "../../types/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FILTER_STATES, SORT_STATES } from "@/constants/constants";
import { useToast } from "@/hooks/use-toast";

type ResponseType = {
  offers: OfferType[];
  totalOffers: number;
};

export function useHome() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const [skip, setSkip] = useState(0);
  const [allOffers, setAllOffers] = useState<any[]>([]);

  const [filtersState, setFiltersState] = useState(FILTER_STATES[0].value);
  const [sortState, setSortState] = useState(SORT_STATES[0].value);
  const [searchState, setSearchState] = useState(
    searchParams.get("search") || ""
  );

  const {
    data: offersData,
    isLoading,
    isFetching,
    error: offerPagesError,
  } = useQuery({
    queryKey: ["offers", skip, filtersState, sortState, searchState],
    queryFn: async () => {
      const res = await axios.get<ResponseType>(`/api/offers`, {
        params: {
          skip,
          limit: Number(process.env.NEXT_PUBLIC_OFFER_LIMIT)!,
          userId: session?.user.id,
          sort: sortState,
          filter: filtersState,
          search: searchState,
        },
      });
      return res.data;
    },
    enabled: !!session?.user.id,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (offersData?.offers) {
      setAllOffers((prev) => {
        return skip === 0 ? offersData.offers : [...prev, ...offersData.offers];
      });
    }
  }, [offersData, skip]);

  const { mutate: deleteAllOffers, isPending: deleteAllOffersIsLoading } =
    useMutation({
      mutationKey: ["deleteAllOffers"],
      mutationFn: async (userId: string) => {
        return await axios.delete(`/api/offers`, {
          data: { userId, filtersState },
        });
      },
      onSuccess: () => {
        setSkip(0);
        setAllOffers([]);
        queryClient.invalidateQueries({
          queryKey: ["offers"],
        });

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
        setSkip(0);
        queryClient.invalidateQueries({
          queryKey: ["offers"],
        });

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

  function updateQueryParams(key: string, value: string | null) {
    const searchUrlValue = new URLSearchParams(searchParams.toString());
    if (value) {
      searchUrlValue.set(key, value);
    } else {
      searchUrlValue.delete(key);
    }
    router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
  }

  const handleFilterChange = (filter: string) => {
    updateQueryParams("filter", filter);
    setFiltersState(filter);
    setSkip(0);
    setAllOffers([]);
  };

  const handleSortChange = (sort: string) => {
    updateQueryParams("sort", sort);

    setSortState(sort);
    setSkip(0);
    setAllOffers([]);
  };

  const debouncedSearch = debounce((search: string) => {
    updateQueryParams("search", search);
    setSkip(0);
    setSearchState(search);
  });

  const loadMoreOffers = () => {
    setSkip((prev) => prev + Number(process.env.NEXT_PUBLIC_OFFER_LIMIT)!);
  };

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
      deleteAllOffers(session.user.id);
    }
  }

  useEffect(() => {
    if (!searchParams.get("sort")) {
      const localSort = localStorage.getItem("sort") || SORT_STATES[0].value;
      const searchUrlValue = new URLSearchParams(searchParams.toString());
      if (localSort) {
        searchUrlValue.set("sort", localSort);
      } else {
        searchUrlValue.delete("sort");
      }
      router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
    }
    if (!searchParams.get("filter")) {
      const localFilter =
        localStorage.getItem("filter") || FILTER_STATES[0].value;
      const searchUrlValue = new URLSearchParams(searchParams.toString());
      if (localFilter) {
        searchUrlValue.set("filter", localFilter);
      } else {
        searchUrlValue.delete("filter");
      }
      router.push(`/?${searchUrlValue.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      filtersState !== searchParams.get("filter")
    ) {
      setFiltersState(
        searchParams.get("filter") ||
          localStorage.getItem("filter") ||
          FILTER_STATES[0].value
      );
    }
    if (
      typeof window !== "undefined" &&
      sortState !== searchParams.get("sort")
    ) {
      setSortState(
        searchParams.get("sort") ||
          localStorage.getItem("sort") ||
          SORT_STATES[0].value
      );
    }
  }, [filtersState, searchParams, sortState]);

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

  return {
    offerPagesIsLoading: isLoading || isFetching || refreshOffersIsLoading,
    offerPagesError,
    filtersState,
    sortState,
    handleSearchChange,
    search: searchState,
    handleRefreshOffers,
    refreshOffersIsLoading,
    handleDeleteAllOffers,
    allOffers,
    totalAvailable: offersData?.totalOffers || 0,
    totalFetched: allOffers.length || 0,
    handleFilterChange,
    handleSortChange,
    loadMoreOffers,
    deleteAllOffersIsLoading,
    setAllOffers,
    setSkip,
  };
}
