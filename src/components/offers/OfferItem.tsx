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
import { useOfferItem } from "./useOfferItem";
import { Loader2, Trash } from "lucide-react";

export default function OfferItem({ offer }: { offer: OfferType }) {
  const { handleDeleteOffer, isDeletingOffer } = useOfferItem();
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
            {offer.lastPrices.length > 0 ? offer.lastPrices.at(-1) : "New"}
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
