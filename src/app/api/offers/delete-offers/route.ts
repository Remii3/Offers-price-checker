import { connectToDatabase } from "@/lib/mongodb";
import { Offer } from "@/models/offer";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const { userId } = await req.json();

    if (!userId) {
      NextResponse.json({ message: "User ID and offer ID are required" });
    }

    await Offer.deleteMany({ userId, status: "deleted" });
    NextResponse.json({ message: "Successfully deleted offers" });
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(`Error deleting offers`, err.message);
    } else {
      console.error(`Error deleting offers:`, err);
    }
    NextResponse.json({ message: "Error deleting offers." });
  }
}
