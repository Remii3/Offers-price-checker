import Link from "next/link";
import { OfferType } from "../../../types/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { buttonVariants } from "../ui/button";

export default function OfferItem({ offer }: { offer: OfferType }) {
  console.log("offer.lastPrices", offer.lastPrices);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{offer.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm flex justify-between flex-wrap">
          <span>Current:</span>
          <span>{offer.currentPrice}</span>
        </p>
        <p className="text-sm flex justify-between flex-wrap">
          <span>Previous:</span>
          <span>
            {" "}
            {offer.lastPrices.length > 0 ? offer.lastPrices.at(-1) : "New"}
          </span>
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={`${offer.url}`}
          rel="noopener noreferrer"
          target="_blank"
          className={`${buttonVariants({ variant: "default" })} w-full`}
        >
          Visit
        </Link>
      </CardFooter>
    </Card>
  );
}
