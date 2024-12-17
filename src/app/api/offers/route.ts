export const fetchCache = "force-no-store";

import { Offer } from "@/models/offer";
import { connectToDatabase } from "@/lib/mongodb";
import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { OfferType } from "../../../../types/types";
import { fetchPrice } from "@/lib/fetchPrice";

async function fetchAllOffersHandler(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const skip = Number(url.searchParams.get("skip") || 0);
    const userId = url.searchParams.get("userId");
    const sort = url.searchParams.get("sort");
    const filter = url.searchParams.get("filter");
    const limit = 2;

    if (!userId || !sort || !filter) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const offers: OfferType[] = await Offer.find({
      userId,
      status: filter,
      name: { $regex: url.searchParams.get("search") || "", $options: "i" },
    })
      .sort({ createdAt: sort === "newest" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    if (offers.length === 0) {
      return NextResponse.json(
        {
          message: "No offers found",
          offers: [],
          totalOffers: 0,
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    const totalOffers = await Offer.countDocuments({ userId, status: filter });

    return NextResponse.json(
      {
        message: "GET check-offer",
        offers,
        totalOffers,
        // nextCursor,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
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

async function createNewOfferHandler(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, url, userId } = await req.json();
    const checkedUrl = url.trim();

    if (!checkedUrl || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const websiteCurrentInfo = await fetchPrice({ url: checkedUrl });

    if (!websiteCurrentInfo) {
      return NextResponse.json(
        {
          message: "Error fetching price",
        },
        { status: 404 }
      );
    }

    const offer = await Offer.create({
      name: name || websiteCurrentInfo.title || "No title",
      url: checkedUrl,
      userId,
      currentPrice: websiteCurrentInfo.price,
      img: websiteCurrentInfo.img,
      status: "new",
    });

    return NextResponse.json(
      {
        message: "Successfully added offer",
        offer,
      },
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === 11000) {
      console.error("Duplicate key error:", err.message);
      return NextResponse.json(
        { message: "Offer with this URL already exists" },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { message: "Error adding offer" },
      { status: 500 }
    );
  }
}

async function deleteAllHandler(req: Request) {
  try {
    await connectToDatabase();

    const { userId, filtersState } = await req.json();

    if (!userId || !filtersState) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    await Offer.deleteMany({ userId, status: filtersState });
    return NextResponse.json(
      { message: "Successfully deleted offers" },
      { status: 200 }
    );
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(`Error deleting offers`, err.message);
    } else {
      console.error(`Error deleting offers:`, err);
    }
    return NextResponse.json(
      { message: "Error deleting offers." },
      { status: 500 }
    );
  }
}

export {
  deleteAllHandler as DELETE,
  fetchAllOffersHandler as GET,
  createNewOfferHandler as POST,
};
