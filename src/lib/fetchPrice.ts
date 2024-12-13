import axios, { isAxiosError } from "axios";
import * as cheerio from "cheerio";

export async function fetchPrice({ url }: { url: string }) {
  console.log("Url", url);
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

    if (url.includes("olx")) {
      return $(`[data-testid="ad-price-container"] h3`).text().trim();
    }

    if (url.includes("otodom")) {
      return $('[data-cy="adPageHeaderPrice"]').text().trim();
    }
    return $(".css-90xrc0").text().trim();
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
