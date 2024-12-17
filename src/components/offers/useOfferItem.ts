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
      return await axios.delete(`/api/offers/${offerId}`, {
        data: { userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
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
