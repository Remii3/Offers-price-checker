import { Offer } from "@/models/offer";
import { connectToDatabase } from "@/utils/mongodb";
import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const offers = await Offer.find({});
    return NextResponse.json({
      message: "Successfully fetched offers",
      offers,
    });
  } catch (err) {
    if (isAxiosError(err)) {
      console.log("Error fetching offers: ", err.message);
    } else {
      console.log("Error fetching offers: ", err);
    }
    return NextResponse.json({ message: "Error fetching offers" });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, url } = await req.json();

    if (!name || !url) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const offer = await Offer.create({ name, url });
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
