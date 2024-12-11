import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchOffers() {
  const res = await axios.get("/api/offers");
  return res.data;
}

export function useOffersSection() {
  const {
    data: offers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const data = await fetchOffers();
      return data.offers;
    },
  });
  return {
    offers,
    isPending,
    error,
  };
}
