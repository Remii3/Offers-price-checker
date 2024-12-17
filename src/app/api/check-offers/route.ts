export const fetchCache = "force-no-store";

import { Offer } from "@/models/offer";
import { connectToDatabase } from "@/lib/mongodb";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { fetchPrice } from "@/lib/fetchPrice";
import { OfferType } from "../../../../types/types";
import { sendNewPriceMail } from "@/lib/mails";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { userId, userEmail } = await req.json();
    if (!userId || !userEmail) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const offers: OfferType[] = await Offer.find({ userId: userId });

    if (!offers.length) {
      return NextResponse.json(
        {
          message: "No offers found",
        },
        { status: 404 }
      );
    }

    const fetchResults = await Promise.all(
      offers.map(async (offer) => {
        try {
          const websiteCurrentInfo = await fetchPrice({ url: offer.url });
          return { offer, websiteCurrentInfo };
        } catch (err) {
          if (isAxiosError(err)) {
            console.error(
              `Error fetching price for ${offer.url}:`,
              err.message
            );
          } else {
            console.error(`Error fetching price for ${offer.url}:`, err);
          }
          return { offer, websiteCurrentPrice: null };
        }
      })
    );

    const bulkOperations = [];
    const failedOffers = [];

    for (const { offer, websiteCurrentInfo } of fetchResults) {
      if (!websiteCurrentInfo) {
        failedOffers.push(offer.url);
        continue;
      }

      const updates: Record<string, string | { [key: string]: string }> = {};

      if (!websiteCurrentInfo.price) {
        updates.$push = { lastPrices: offer.currentPrice };
        updates.currentPrice = "deleted";
        updates.status = "deleted";
      } else if (!offer.currentPrice) {
        updates.currentPrice = websiteCurrentInfo.price;
        updates.img = websiteCurrentInfo.img;
        updates.status = "changed";
      } else if (offer.currentPrice !== websiteCurrentInfo.price) {
        updates.currentPrice = websiteCurrentInfo.price;
        updates.status = "changed";
        updates.img = websiteCurrentInfo.img;
        updates.$push = { lastPrices: offer.currentPrice };

        // sendNewPriceMail({
        //   ...offer,
        //   lastPrice: offer.currentPrice,
        //   currentPrice: websiteCurrentInfo.price || "deleted",
        //   userEmail,
        // });
      } else if (
        offer.lastPrices.at(-1) !== offer.currentPrice &&
        offer.status === "changed"
      ) {
        updates.status = "notChanged";
        updates.$push = { lastPrices: offer.currentPrice };
      } else if (
        offer.currentPrice === websiteCurrentInfo.price &&
        offer.status === "changed"
      ) {
        updates.status = "notChanged";
      } else if (offer.status === "new") {
        updates.status = "notChanged";
        updates.$push = { lastPrices: offer.currentPrice };
      }

      if (Object.keys(updates).length > 0) {
        bulkOperations.push({
          updateOne: {
            filter: { _id: offer._id },
            update: updates,
          },
        });
      }
    }

    if (bulkOperations.length > 0) {
      await Offer.bulkWrite(bulkOperations.filter((op) => op !== null));
    }

    return NextResponse.json(
      {
        message: "Prices updated successfully",
      },
      { status: 200 }
    );
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
