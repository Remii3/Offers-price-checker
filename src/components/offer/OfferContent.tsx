"use client";

import { ArrowLeft, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "../ui/chart";
import useOfferContent from "./useOfferContent.hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { formatNumberWithSpaces } from "@/lib/formatNumberWithSpaces";

const chartConfig = {
  desktop: {
    label: "Prices",
    color: "#171717",
  },
} satisfies ChartConfig;

const normalizePrices = (data: string[] | undefined) => {
  if (!data) return [];
  return data.map((price, index) => {
    const cleanedPrice = price.replace(/[^0-9.]/g, "").replace(/\s+/g, "");
    const numericValue = parseFloat(cleanedPrice) || 0;

    return { index: index + 1, price: numericValue };
  });
};

export default function OfferContent({ offerId }: { offerId: string }) {
  const router = useRouter();

  const {
    offer,
    isPending,
    handleRefreshOffer,
    isRefreshing,
    handleDeleteOffer,
    isDeleting,
  } = useOfferContent({
    offerId,
  });

  const chartData = useMemo(
    () => normalizePrices(offer?.lastPrices),
    [offer?.lastPrices]
  );

  return (
    <div className="flex flex-col my-8 h-full max-w-screen-lg mx-auto relative sm:px-0 px-4">
      {isPending && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
      {!isPending && offer && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => router.back()}
                variant={"outline"}
                size={"icon"}
                className="rounded-full min-w-[36px]"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-medium">{offer.name}</h1>
            </div>
            <div className="flex gap-4 justify-end">
              <Button
                onClick={() => handleRefreshOffer()}
                size={"sm"}
                disabled={isRefreshing}
              >
                <span className={`flex gap-1 items-center`}>
                  Refresh
                  <RefreshCcw
                    className={`${isRefreshing && "animate-spin"} h-6 w-6`}
                  />
                </span>
              </Button>
              <Button
                onClick={() => handleDeleteOffer()}
                size={"sm"}
                variant={"destructive"}
                disabled={isDeleting}
              >
                <Loader2
                  className={`${
                    isDeleting ? "opacity-100" : "opacity-0"
                  } absolute h-6 w-6`}
                />
                <span
                  className={`${
                    isDeleting ? "opacity-0" : "opacity-100"
                  } flex gap-1 items-center`}
                >
                  Delete
                  <Trash2 className="h-6 w-6" />
                </span>
              </Button>
            </div>
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full relative"
            >
              {chartData.length > 0 ? (
                <LineChart data={chartData} accessibilityLayer>
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis
                    dataKey={"index"}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey={"price"}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${formatNumberWithSpaces(Number(value))}`,
                      "Price",
                    ]}
                    labelFormatter={(label) => `Point: ${label}`}
                    cursor={{ stroke: "#171717", strokeDasharray: "3 3" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#171717"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              ) : (
                <p className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  No prices available
                </p>
              )}
            </ChartContainer>
            <div className="space-y-4">
              <p className="space-x-2">
                <span>Current price:</span>
                <span className="font-medium">{offer.currentPrice}</span>
              </p>
              <div>
                <p>Last prices:</p>
                {offer.lastPrices.length > 0 ? (
                  <ul>
                    {offer.lastPrices.map((price, i) => (
                      <li key={price + "price" + i}>{price}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No prices available
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
