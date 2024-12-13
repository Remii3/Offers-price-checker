import { Offer } from "@/models/offer";
import { connectToDatabase } from "@/lib/mongodb";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { fetchPrice } from "@/lib/fetchPrice";
import { OfferType } from "../../../../types/types";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const offers: OfferType[] = await Offer.find({ userId: userId });

    if (!offers.length) {
      return NextResponse.json({
        message: "No offers found",
      });
    }

    const priceResults = await Promise.all(
      offers.map(async (offer) => {
        try {
          const websiteCurrentPrice = await fetchPrice({ url: offer.url });
          return { offer, websiteCurrentPrice };
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

    const bulkOperations = priceResults
      .filter(({ websiteCurrentPrice }) => websiteCurrentPrice)
      .map(({ offer, websiteCurrentPrice }) => {
        const updates: Record<string, any> = {};
        if (!offer.currentPrice) {
          // Initial price setup
          updates.currentPrice = websiteCurrentPrice;
          updates.status = "changed";
        } else if (offer.currentPrice !== websiteCurrentPrice) {
          // Price has changed
          updates.currentPrice = websiteCurrentPrice;
          updates.status = "changed";
          updates.$push = { lastPrices: offer.currentPrice };
        } else if (
          offer.lastPrices.at(-1) !== offer.currentPrice &&
          offer.status === "changed"
        ) {
          // Price hasn't changed but lastPrices/status needs updating
          updates.status = "notChanged";
          updates.$push = { lastPrices: offer.currentPrice };
        } else if (
          offer.currentPrice === websiteCurrentPrice &&
          (offer.status === "changed" || offer.status === "new")
        ) {
          // Mark status as "notChanged"
          updates.status = "notChanged";
        }

        if (Object.keys(updates).length === 0) return null;

        return {
          updateOne: {
            filter: { _id: offer._id },
            update: updates,
          },
        };
      })
      .filter(Boolean);

    if (bulkOperations.length > 0) {
      await Offer.bulkWrite(bulkOperations.filter((op) => op !== null));
    }

    return NextResponse.json({
      message: "Prices updated successfully",
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
