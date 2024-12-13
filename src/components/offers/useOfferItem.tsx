import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export function useOfferItem() {
  const queryClient = useQueryClient();
  const { data } = useSession();
  const { mutate: deleteOffer, isPending: isDeletingOffer } = useMutation({
    mutationKey: ["deleteOffer"],
    mutationFn: async ({ offerId }: { offerId: string }) => {
      if (!data) {
        return;
      }
      return await axios.delete(`/api/offers/delete-offer`, {
        data: { offerId, userId: data.user.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "offers" });
      queryClient.refetchQueries({ queryKey: ["offers"] });
    },
  });

  return {
    deleteOffer,
    isDeletingOffer,
  };
}
