import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction } from "react";

export default function useOfferItem({
  setAllOffers,
  setSkip,
}: {
  setAllOffers: Dispatch<SetStateAction<any[]>>;
  setSkip: Dispatch<SetStateAction<number>>;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: session } = useSession();

  const { mutate: deleteOffer, isPending: isDeletingOffer } = useMutation({
    mutationKey: ["deleteOffer"],
    mutationFn: async ({
      offerId,
      userId,
    }: {
      offerId: string;
      userId: string;
    }) => {
      await axios.delete(`/offers/${offerId}`, {
        data: { userId },
      });
      return offerId;
    },
    onSuccess: (offerId: string) => {
      setSkip(0);
      queryClient.invalidateQueries({
        queryKey: ["offers"],
      });
      setAllOffers((prev) => {
        return prev.filter((o) => o._id !== offerId);
      });
      toast({ title: "Success", description: "Offer deleted." });
    },
    onError: (err) => {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete offer." });
    },
  });
  function handleDeleteOffer(offerId: string) {
    if (session?.user.id) {
      deleteOffer({ offerId, userId: session?.user.id });
    }
  }
  return { handleDeleteOffer, isDeletingOffer };
}
