export const fetchCache = "force-no-store";

import { fetchPrice } from "@/lib/fetchPrice";
import { sendNewPriceMail } from "@/lib/mails";
import { connectToDatabase } from "@/lib/mongodb";
import { Offer } from "@/models/offer";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { OfferType } from "../../../../../types/types";

async function postOfferRefresh(req: Request) {
  try {
    await connectToDatabase();

    const { userId, userEmail } = await req.json();

    const offerId = req.url.split("/").pop();

    if (!userId || !userEmail || !offerId) {
      return NextResponse.json(
        { message: "Missing important fields." },
        { status: 400 }
      );
    }

    const offer: OfferType | null = await Offer.findOne({
      userId,
      _id: offerId,
    });

    if (!offer) {
      return NextResponse.json(
        {
          message: "Offer doesn't exist",
        },
        { status: 404 }
      );
    }

    const websiteCurrentInfo = await fetchPrice({ url: offer.url });

    const bulkOperations = [];

    if (!websiteCurrentInfo) {
      return NextResponse.json(
        { message: "Offer url doesn't work" },
        { status: 500 }
      );
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

    if (bulkOperations.length > 0) {
      await Offer.bulkWrite(bulkOperations.filter((op) => op !== null));
    }

    return NextResponse.json({
      message: "Prices updated successfully",
    });
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(`Error fetching offer`, err.message);
    } else {
      console.error(`Error fetching offer:`, err);
    }
    return NextResponse.json({ message: "Error fetching offer." });
  }
}

export { postOfferRefresh as POST };
