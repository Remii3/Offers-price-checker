"use client";

import axios, { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { OfferType } from "../../types/types";
import NewOfferForm from "@/components/new-offer/NewOfferForm";

type CheckOfferResponse = {
  newOffers: OfferType[];
  changedOffers: OfferType[];
  unchangedOffers: OfferType[];
};

export default function Home() {
  // const [offers, setOffers] = useState<CheckOfferResponse>();
  // const [isLoading, setIsLoading] = useState(true);

  // const fetchOffers = useCallback(async () => {
  //   try {
  //     const res = await axios.get("/api/check-offer");
  //     const data = res.data;

  //     setOffers(data.offers);
  //     setIsLoading(false);
  //   } catch (err) {
  //     setIsLoading(false);
  //     if (isAxiosError(err)) {
  //       console.log("Error fetching offers: ", err.message);
  //     } else {
  //       console.log("Error fetching offers: ", err);
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchOffers();
  // }, [fetchOffers]);

  return (
    <div className="">
      <NewOfferForm />
    </div>
  );
}
