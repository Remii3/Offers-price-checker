import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchOffers() {
  const res = await axios.get(`/api/offers`);
  return res.data;
}

export function useOffersPage() {
  const {
    data: offers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: fetchOffers,
  });
  return { offers, isPending, error };
}
