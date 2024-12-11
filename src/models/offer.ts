import { Schema, model, models } from "mongoose";

const OfferSchema = new Schema({
  name: { type: String, required: false, default: "No name" },
  url: { type: String, required: true },
  lastPrices: { type: [String], required: false, default: [] },
});

export const Offer = models.Offer || model("Offer", OfferSchema);
