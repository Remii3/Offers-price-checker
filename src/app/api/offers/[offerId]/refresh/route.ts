import { connectToDatabase } from "@/lib/mongodb";
import { Offer } from "@/models/offer";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

async function postOfferRefresh(req: Request) {
  try {
    await connectToDatabase();

    const { userId, offerId } = await req.json();

    if (!userId || !offerId) {
      return NextResponse.json({
        message: "User ID and offer ID are required",
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

export { postOfferRefresh as POST };
