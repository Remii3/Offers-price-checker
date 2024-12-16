import { Schema, model, models } from "mongoose";

const OfferSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    lastPrices: { type: [String], required: false, default: [] },
    currentPrice: { type: String, required: false, default: "" },
    userId: { type: String, required: true },
    status: { type: String, required: false, default: "notChanged" },
    img: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

export const Offer = models.Offer || model("Offer", OfferSchema);
