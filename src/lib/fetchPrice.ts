import axios, { isAxiosError } from "axios";
import * as cheerio from "cheerio";

export async function fetchPrice({ url }: { url: string }) {
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
        img: $('meta[property="og:image"]').attr("content") || "",
        title: $('meta[property="og:title"]').attr("content") || "",
      }),
    };

    // Determine the site and parse
    for (const key in parsers) {
      if (url.includes(key)) {
        const result = parsers[key as keyof typeof parsers]();
        console.log(`Parsed data for ${key}:`, result);
        return result;
      }
    }

    return {
      price: $(".css-90xrc0").text().trim() || "",
      img: $('meta[property="og:image"]').attr("content") || "",
      title: $('meta[property="og:title"]').attr("content") || "",
    };
  } catch (err) {
    if (isAxiosError(err)) {
      console.log("err", err);
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
