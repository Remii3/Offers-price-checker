import { connectToDatabase } from "@/lib/mongodb";
import { Offer } from "@/models/offer";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

async function getOfferData(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);

    const userId = url.searchParams.get("userId");
    const offerId = url.searchParams.get("offerId");

    if (!userId || !offerId) {
      return NextResponse.json({
        message: "User ID and offer ID are required",
        url,
        userId,
        offerId,
      });
    }
    const offerData = await Offer.findOne({ userId, _id: offerId });
    return NextResponse.json({
      message: "Successfully fetched offer",
      offerData,
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

async function deleteOffer(req: Request) {
  try {
    await connectToDatabase();

    const { userId, offerId } = await req.json();

    if (!userId || !offerId) {
      return NextResponse.json({
        message: "User ID and offer ID are required",
      });
    }
    await Offer.deleteOne({ userId, _id: offerId });
    return NextResponse.json({ message: "Successfully deleted offer" });
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(`Error deleting offer`, err.message);
    } else {
      console.error(`Error deleting offer:`, err);
    }
    return NextResponse.json({ message: "Error deleting offer." });
  }
}

export { getOfferData as GET, deleteOffer as DELETE };
