"use client";

import Link from "next/link";
import { OfferType } from "../../../types/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button, buttonVariants } from "../ui/button";
import Image from "next/image";
import { Loader2, Trash } from "lucide-react";
import useOfferItem from "./useOfferItem.hooks";
import { Dispatch, SetStateAction } from "react";

export default function OfferItem({
  offer,
  setAllOffers,
  setSkip,
}: {
  offer: OfferType;
  setAllOffers: Dispatch<SetStateAction<any[]>>;
  setSkip: Dispatch<SetStateAction<number>>;
}) {
  const { handleDeleteOffer, isDeletingOffer } = useOfferItem({
    setAllOffers,
    setSkip,
  });
  return (
    <Card>
      <CardHeader>
        <div className="h-[180px] relative w-full object-center bg-gray-200 rounded-md overflow-hidden">
          {offer.img && (
            <Image
              src={offer.img}
              alt={offer.name}
              width={300}
              height={500}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <CardTitle className="line-clamp-1">
          <Link href={`/offers/${offer._id}`}>{offer.name}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm flex justify-between flex-wrap">
          <span>Current:</span>
          <span>{offer.currentPrice}</span>
        </p>
        <p className="text-sm flex justify-between flex-wrap">
          <span>Previous:</span>
          <span>
            {offer.lastPrices.length > 1 ? offer.lastPrices.at(-2) : "New"}
          </span>
        </p>
      </CardContent>
      <CardFooter className="gap-4">
        <Link
          href={`${offer.url}`}
          rel="noopener noreferrer"
          target="_blank"
          className={`${buttonVariants({ variant: "default" })} w-full`}
        >
          Visit
        </Link>
        <Button
          onClick={() => handleDeleteOffer(offer._id)}
          disabled={isDeletingOffer}
          variant={"destructive"}
        >
          {isDeletingOffer && <Loader2 className="animate-spin" />}
          {!isDeletingOffer && <Trash />}
        </Button>
      </CardFooter>
    </Card>
  );
}
