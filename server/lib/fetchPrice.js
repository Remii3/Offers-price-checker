const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPrice({ url }) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });
    const $ = cheerio.load(data);

    const parsers = {
      olx: () => ({
        price: $(`[data-testid="ad-price-container"] h3`).text().trim() || "",
        img: $(`[data-testid="image-galery-container"] img`).attr("src") || "",
        title: $(`[data-testid="ad_title"] h4`).text().trim() || "",
      }),
      otodom: () => ({
        price: $('[data-cy="adPageHeaderPrice"]').text().trim() || "",
        img: $("div.image-gallery-slides img").attr("src") || "",
        title: $('[data-cy="adPageAdTitle"]').text().trim() || "",
      }),
    };

    for (const key in parsers) {
      if (url.includes(key)) {
        const result = parsers[key]();
        return result;
      }
    }

    return {
      price: $(".css-90xrc0").text().trim() || "",
      img: $('meta[property="og:image"]').attr("content") || "",
      title: $('meta[property="og:title"]').attr("content") || "",
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.status === 403) {
        console.error("They changed security measures, please update the code");
      }
      console.error("Error fetching price:", err.message);
    } else {
      console.error("Error fetching price:", err);
    }
    return null;
  }
}

module.exports = fetchPrice;
