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
          limit: 1,
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
        const offerIds = new Set(prev.map((offer) => offer._id));
        const newOffers = offersData.offers.filter(
          (offer) => !offerIds.has(offer._id)
        );
        return [...prev, ...newOffers];
      });
    }
  }, [offersData]);

  const debouncedSearch = useMemo(
    () =>
      debounce((search: string) => {
        setSearchState(search);
        setSkip(0);
        setAllOffers([]);
        queryClient.invalidateQueries({ queryKey: ["offers"] });
      }, 500),
    [queryClient]
  );

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
        setAllOffers([]);
        queryClient.invalidateQueries({ queryKey: ["offers"] });

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

  const handleFilterChange = useCallback(
    (filter: string) => {
      setFiltersState(filter);
      setSkip(0);
      setAllOffers([]);
      router.push(`/?filter=${filter}`, { scroll: false });
    },
    [router]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      setSortState(sort);
      setSkip(0);
      setAllOffers([]);
      router.push(`/?sort=${sort}`, { scroll: false });
    },
    [router]
  );

  const loadMoreOffers = () => {
    setSkip((prev) => prev + 15);
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
  };
}
