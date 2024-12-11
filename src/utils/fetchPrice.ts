import axios, { isAxiosError } from "axios";
import * as cheerio from "cheerio";

export async function fetchPrice({ url }: { url: string }) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
    const $ = cheerio.load(data);

    if (url.includes("olx"))
      return $(`[data-testid="ad-price-container"] h3`).text().trim();
    if (url.includes("otodom"))
      return $('[data-cy="adPageHeaderPrice"]').text().trim();
    return $(".css-90xrc0").text().trim();
  } catch (err) {
    if (isAxiosError(err)) {
      console.error("Error fetching price:", err.message);
    } else {
      console.error("Error fetching price:", err);
    }
    return null;
  }
}
