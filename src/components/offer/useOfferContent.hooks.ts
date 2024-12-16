"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { OfferType } from "../../../types/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type OfferResponse = {
  offerData: OfferType;
};

export default function useOfferContent({ offerId }: { offerId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const {
    data: offer,
    isPending,
    error,
  } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: async () => {
      const res = await axios.get<OfferResponse>(`/api/offers/${offerId}`, {
        params: {
          userId: session?.user.id,
        },
      });
      return res.data.offerData;
    },
    enabled: !!offerId && !!session?.user.id,
  });

  const {
    mutate: refreshOffer,
    isPending: isRefreshing,
    error: refreshError,
  } = useMutation({
    mutationKey: ["offerRefresh"],
    mutationFn: async () => {
      const res = await axios.post(`/api/offers/${offerId}/refresh`, {
        userId: session!.user.id,
        offerId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
      toast({ title: "Success", description: "Offer refreshed" });
    },
    onError: (err) => {
      console.error(err);
      toast({ title: "Error", description: "Failed to refresh offer" });
    },
  });

  const {
    mutate: deleteOffer,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationKey: ["offerDelete"],
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await axios.delete(`/api/offers/${offerId}`, {
        data: { userId },
      });
      return res.data;
    },
    onSuccess: () => {
      router.replace("/");
      toast({ title: "Success", description: "Offer deleted" });
    },
    onError: (err) => {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete offer." });
    },
  });

  function handleDeleteOffer() {
    if (session?.user.id) {
      deleteOffer({ userId: session.user.id });
    }
  }

  return {
    offer,
    isPending,
    error,
    refreshOffer,
    isRefreshing,
    refreshError,
    handleDeleteOffer,
    isDeleting,
    deleteError,
  };
}
