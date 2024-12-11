import { Offer } from "@/models/offer";
import { fetchPrice } from "@/utils/fetchPrice";
import { OfferType } from "../../../../types/types";
import { connectToDatabase } from "@/utils/mongodb";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export async function GET() {
  try {
    await connectToDatabase();

    const newOffers: OfferType[] = [];
    const changedOffers: OfferType[] = [];
    const unchangedOffers: OfferType[] = [];

    const offers: OfferType[] = await Offer.find();
    if (!offers || !offers.length) {
      return { message: "No offers found" };
    }

    for (const offer of offers) {
      const currentPrice = await fetchPrice({ url: offer.url });
      if (!currentPrice) {
        continue;
      }

      if (offer.lastPrices.length > 0) {
        const lastPrice = offer.lastPrices[offer.lastPrices.length - 1];
        if (lastPrice !== currentPrice) {
          await Offer.updateOne(
            { _id: offer._id },
            { $push: { lastPrices: currentPrice } }
          );
          changedOffers.push(offer);
        } else {
          console.log("No price change for", offer.url);
          unchangedOffers.push(offer);
        }
      } else {
        await Offer.updateOne(
          { _id: offer._id },
          { $push: { lastPrices: currentPrice } }
        );
        newOffers.push(offer);
      }
    }

    return NextResponse.json({
      message: "GET check-offer",
      offers: { newOffers, changedOffers, unchangedOffers },
    });
  } catch (err) {
    if (isAxiosError(err)) {
      console.error("Error in API:", err.message);
    } else {
      console.error("Error in API:", err);
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
