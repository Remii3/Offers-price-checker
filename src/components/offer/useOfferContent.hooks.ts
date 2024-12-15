import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { OfferType } from "../../../types/types";

type OfferResponse = {
  offerData: OfferType;
};

export default function useOfferContent({ offerId }: { offerId: string }) {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const {
    data: offer,
    isPending,
    error,
  } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: async () => {
      const res = await axios.get<OfferResponse>(`/api/offers/${offerId}`, {
        params: {
          offerId,
          userId: data!.user.id,
        },
      });
      return res.data.offerData;
    },
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
