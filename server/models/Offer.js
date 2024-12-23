const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
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
OfferSchema.index({ userId: 1, url: 1 }, { unique: true });

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;
