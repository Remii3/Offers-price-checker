import { Offer } from "@/models/offer";
import { connectToDatabase } from "@/lib/mongodb";
import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { OfferType } from "../../../../types/types";
import { fetchPrice } from "@/lib/fetchPrice";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const cursor = Number(url.searchParams.get("cursor") || 0);
    const userId = url.searchParams.get("userId");
    const sort = url.searchParams.get("sort");
    const filter = url.searchParams.get("filter");
    const limit = 15;

    if (!userId || !sort || !filter) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const offers: OfferType[] = await Offer.find({ userId, status: filter })
      .sort({ createdAt: sort === "newest" ? -1 : 1 })
      .skip(cursor * limit)
      .limit(limit);

    if (offers.length === 0) {
      return NextResponse.json({
        message: "No offers found",
        offers: { new: [], changed: [], notChanged: [] },
        nextCursor: null,
      });
    }

    // const categorizedOffers = offers.reduce(
    //   (acc, offer) => {
    //     if (offer.status) {
    //       acc[offer.status as keyof typeof acc].push(offer);
    //     }
    //     return acc;
    //   },
    //   {
    //     new: [] as OfferType[],
    //     changed: [] as OfferType[],
    //     notChanged: [] as OfferType[],
    //   }
    // );

    const totalOffers = await Offer.countDocuments({ userId, status: filter });
    const hasNextPage = (cursor + 1) * limit < totalOffers;
    const nextCursor = hasNextPage ? cursor + 1 : null;

    return NextResponse.json({
      message: "GET check-offer",
      offers,
      nextCursor,
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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, url, userId } = await req.json();

    if (!url || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const websiteCurrentPrice = await fetchPrice({ url });

    if (!websiteCurrentPrice) {
      return NextResponse.json({
        message: "Error fetching price",
        status: 400,
      });
    }

    const offer = await Offer.create({
      name: name || "No name",
      url,
      userId,
      currentPrice: websiteCurrentPrice,
      status: "new",
    });
    console.log("offer", offer);
    return NextResponse.json({
      message: "Successfully added offer",
      offer,
    });
  } catch (err) {
    if (isAxiosError(err)) {
      console.log("Error adding offer: ", err.message);
    } else {
      console.log("Error adding offer: ", err);
    }
    return NextResponse.json({ message: "Error adding offer" });
  }
}
