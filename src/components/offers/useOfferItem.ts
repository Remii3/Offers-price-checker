import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export function useOfferItem() {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const { toast } = useToast();
  const { mutate: deleteOffer, isPending: isDeletingOffer } = useMutation({
    mutationKey: ["deleteOffer"],
    mutationFn: async ({
      offerId,
      userId,
    }: {
      offerId: string;
      userId: string;
    }) => {
      await axios.delete(`/api/offers/${offerId}`, {
        data: { userId },
      });
      return offerId;
    },
    onSuccess: (deletedOfferId) => {
      const queries = queryClient.getQueriesData({ queryKey: ["offers"] });

      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;

        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;
          console.log("pages", oldData.pages);
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              offers: page.offers.filter(
                (offer: any) => offer._id !== deletedOfferId
              ),
            })),
          };
        });
      });

      toast({ title: "Success", description: "Offer deleted." });
    },
    onError: (err) => {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete offer." });
    },
  });

  function handleDeleteOffer(offerId: string) {
    if (data?.user.id) {
      deleteOffer({ offerId, userId: data?.user.id });
    }
  }

  return {
    handleDeleteOffer,
    isDeletingOffer,
  };
}
