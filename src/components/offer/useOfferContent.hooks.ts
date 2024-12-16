"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { OfferType } from "../../../types/types";

type OfferResponse = {
  offerData: OfferType;
};

export default function useOfferContent({ offerId }: { offerId: string }) {
  const queryClient = useQueryClient();
  console.log("Hook id", offerId);
  const { data } = useSession();
  const {
    data: offer,
    isPending,
    error,
  } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: async () => {
      console.log("userId", data?.user.id, "offerId", offerId);
      const res = await axios.get<OfferResponse>(`/api/offers/${offerId}`, {
        params: {
          userId: data?.user.id,
        },
      });
      console.log("Offer return", res.data);
      return res.data.offerData;
    },
    enabled: !!offerId && !!data?.user.id,
  });

  const {
    mutate: refreshOffer,
    isPending: isRefreshing,
    error: refreshError,
  } = useMutation({
    mutationKey: ["offerRefresh"],
    mutationFn: async () => {
      const res = await axios.post(`/api/offers/${offerId}/refresh`, {
        userId: data!.user.id,
        offerId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
    },
  });

  const {
    mutate: deleteOffer,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationKey: ["offerDelete"],
    mutationFn: async () => {
      const data = await axios.delete(`/api/offers/${offerId}`);
      return data.data;
    },
  });
  console.log("Hook", offer);
  return {
    offer,
    isPending,
    error,
    refreshOffer,
    isRefreshing,
    refreshError,
    deleteOffer,
    isDeleting,
    deleteError,
  };
}
