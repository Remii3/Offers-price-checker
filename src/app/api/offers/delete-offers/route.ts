import { connectToDatabase } from "@/lib/mongodb";
import { Offer } from "@/models/offer";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

async function deleteAllHandler(req: Request) {
  try {
    await connectToDatabase();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({
        message: "User ID and offer ID are required",
      });
    }

    await Offer.deleteMany({ userId, status: "deleted" });
    return NextResponse.json({ message: "Successfully deleted offers" });
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(`Error deleting offers`, err.message);
    } else {
      console.error(`Error deleting offers:`, err);
    }
    return NextResponse.json({ message: "Error deleting offers." });
  }
}

export { deleteAllHandler as DELETE };
