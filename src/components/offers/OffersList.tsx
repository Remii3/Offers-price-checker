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

type PropsType = {
  offers: OfferType[];
  heading: string;
};

export default function OffersList({ offers, heading }: PropsType) {
  return (
    <div>
      <h2>{heading}</h2>
      <ul>
        {offers.map((offer) => (
          <li key={offer._id}>
            <Card>
              <CardHeader>
                <CardTitle>{offer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Current offer price{offer.lastPrices.at(-1)}</p>
                {offer.lastPrices.length > 1 && (
                  <p>Previous offer price{offer.lastPrices.at(-2)}</p>
                )}
              </CardContent>
              <CardFooter>
                <Link
                  href={`${offer.url}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  Visit
                </Link>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
