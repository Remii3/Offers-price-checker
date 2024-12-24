const express = require("express");
const mongoose = require("mongoose");
const Offer = require("./models/Offer");
const fetchPrice = require("./lib/fetchPrice");
const dotenv = require("dotenv");
const axios = require("axios");
const app = express();
const cors = require("cors");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const router = express.Router();

router.post("/check-offers", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing variables" });
  }

  try {
    const offers = await Offer.find({ userId }).lean();

    if (offers.length === 0) {
      return res.status(400).json({ message: "No offers found", offers: [] });
    }

    const fetchResults = await Promise.all(
      offers.map(async (offer) => {
        try {
          const websiteCurrentInfo = await fetchPrice({ url: offer.url });
          return { offer, websiteCurrentInfo };
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error(
              `Error fetching price for ${offer.url}:`,
              err.message
            );
          } else {
            console.error(`Error fetching price for ${offer.url}:`, err);
          }
          return { offer, websiteCurrentPrice: null };
        }
      })
    );

    const bulkOperations = [];
    const failedOffers = [];

    for (const { offer, websiteCurrentInfo } of fetchResults) {
      if (!websiteCurrentInfo) {
        failedOffers.push(offer.url);
        continue;
      }

      const updates = {};

      if (!websiteCurrentInfo.price) {
        updates.currentPrice = "deleted";
        updates.status = "deleted";
      } else if (!offer.currentPrice) {
        updates.currentPrice = websiteCurrentInfo.price;
        updates.img = websiteCurrentInfo.img;
        updates.status = "changed";
      } else if (offer.currentPrice !== websiteCurrentInfo.price) {
        updates.$push = { lastPrices: websiteCurrentInfo.price };
        updates.currentPrice = websiteCurrentInfo.price;
        updates.img = websiteCurrentInfo.img;
        updates.status = "changed";
      } else if (
        offer.lastPrices.at(-1) !== offer.currentPrice &&
        offer.status === "changed"
      ) {
        updates.status = "notChanged";
        updates.$push = { lastPrices: offer.currentPrice };
      } else if (
        offer.currentPrice === websiteCurrentInfo.price &&
        offer.status === "changed"
      ) {
        updates.status = "notChanged";
      } else if (offer.status === "new") {
        updates.status = "notChanged";
      }

      if (Object.keys(updates).length > 0) {
        bulkOperations.push({
          updateOne: {
            filter: { _id: offer._id },
            update: updates,
          },
        });
      }
    }

    if (bulkOperations.length > 0) {
      await Offer.bulkWrite(bulkOperations.filter((op) => op !== null));
    }
    return res.status(200).json({ message: "Offers checked" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/check-offers/:offerId", async (req, res) => {
  const { userId } = req.body;
  const { offerId } = req.params;
  if (!userId || !offerId) {
    return res.status(400).json({ message: "Missing variables" });
  }

  try {
    const offer = await Offer.findOne({
      _id: offerId,
      userId,
    }).lean();
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    const websiteCurrentInfo = await fetchPrice({ url: offer.url });

    const bulkOperations = [];
    if (!websiteCurrentInfo) {
      return res.status(500).json({ message: "Offer not found" });
    }

    const updates = {};

    if (!websiteCurrentInfo.price) {
      updates.currentPrice = "deleted";
      updates.status = "deleted";
    } else if (!offer.currentPrice) {
      updates.currentPrice = websiteCurrentInfo.price;
      updates.img = websiteCurrentInfo.img;
      updates.status = "changed";
    } else if (offer.currentPrice !== websiteCurrentInfo.price) {
      updates.$push = { lastPrices: websiteCurrentInfo.price };
      updates.currentPrice = websiteCurrentInfo.price;
      updates.img = websiteCurrentInfo.img;
      updates.status = "changed";
    } else if (
      offer.lastPrices.at(-1) !== offer.currentPrice &&
      offer.status === "changed"
    ) {
      updates.status = "notChanged";
      updates.$push = { lastPrices: offer.currentPrice };
    } else if (
      offer.currentPrice === websiteCurrentInfo.price &&
      offer.status === "changed"
    ) {
      updates.status = "notChanged";
    } else if (offer.status === "new") {
      updates.status = "notChanged";
    }

    if (Object.keys(updates).length > 0) {
      bulkOperations.push({
        updateOne: {
          filter: { _id: offer._id },
          update: updates,
        },
      });
    }

    if (bulkOperations.length > 0) {
      await Offer.bulkWrite(bulkOperations.filter((op) => op !== null));
    }

    return res.status(200).json({ message: "Offers checked" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/offers", async (req, res) => {
  const { name, url, userId } = req.body;
  if (!name || !url || !userId) {
    return res.status(400).json({ message: "Missing variables" });
  }
  const transformedUrl = url.trim();

  try {
    const websiteCurrentInfo = await fetchPrice({ url: transformedUrl });
    if (!websiteCurrentInfo) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    const offer = new Offer({
      name: name || websiteCurrentInfo.name || "No title",
      url: transformedUrl,
      userId,
      currentPrice: websiteCurrentInfo.price,
      lastPrices: [websiteCurrentInfo.price],
      status: "new",
    });

    return res.status(201).json({ offer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/offers", async (req, res) => {
  const { skip, userId, sort, filter, limit, search } = req.query;
  if (!userId || !skip || !sort || !filter || !limit) {
    return res.status(400).json({ message: "Missing variables" });
  }

  try {
    const offers = await Offer.find({
      userId,
      status: filter,
      name: { $regex: search || "", $options: "i" },
    })
      .sort({ createdAt: sort === "newest" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    if (offers.length === 0) {
      return res
        .status(200)
        .json({ message: "No offers found", offers: [], totalOffers: 0 });
    }

    const totalOffers = await Offer.countDocuments({
      userId,
      status: filter,
      name: { $regex: search || "", $options: "i" },
    });

    return res.status(200).json({ offers, totalOffers });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/offers/:offerId", async (req, res) => {
  const { userId } = req.query;
  const { offerId } = req.params;
  if (!userId || !offerId) {
    return res.status(400).json({ message: "Missing variables" });
  }

  try {
    const offer = await Offer.findOne({ _id: offerId, userId });

    return res.status(200).json({ offer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/offers", async (req, res) => {
  const { userId, filtersState } = req.body;

  try {
    if (!userId || !filtersState) {
      return res.status(400).json({ message: "Missing variables" });
    }
    await Offer.deleteMany({ userId, status: filtersState });
    return res.status(200).json({ message: "Offers deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/offers/:offerId", async (req, res) => {
  const { userId } = req.body;
  const { offerId } = req.params;
  if (!userId || !offerId) {
    console.error("Missing variables", userId, offerId);
    return res.status(400).json({ message: "Missing variables" });
  }
  try {
    await Offer.deleteOne({ _id: offerId, userId: userId });

    return res.status(200).json({ message: "Offer deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use(router);

app.listen(5000, () => {
  console.log("Server listens on port 5000");
});
