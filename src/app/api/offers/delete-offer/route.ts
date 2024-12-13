import { connectToDatabase } from "@/lib/mongodb";
import { Offer } from "@/models/offer";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

async function handler(req: Request) {
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

export { handler as DELETE };
