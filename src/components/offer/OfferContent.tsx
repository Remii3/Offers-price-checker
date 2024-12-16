"use client";

import { ArrowLeft, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
// import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
// import { ChartConfig, ChartContainer } from "../ui/chart";
import useOfferContent from "./useOfferContent.hooks";
import { useRouter } from "next/navigation";
// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];
// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "#FF0000",
//   },
// } satisfies ChartConfig;

export default function OfferContent({ offerId }: { offerId: string }) {
  const router = useRouter();

  const {
    offer,
    isPending,
    refreshOffer,
    isRefreshing,
    deleteOffer,
    isDeleting,
  } = useOfferContent({
    offerId,
  });

  return (
    <div className="flex flex-col pt-8 h-full max-w-screen-lg mx-auto relative">
      {isPending && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
      {!isPending && offer && (
        <>
          <div className="space-y-3">
            {/* TODO add chart */}
            {/* <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis
            dataKey={"month"}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(val) => val.slice(0, 3)}
            />
            <Line type="monotone" dataKey="desktop" stroke="#FF0000" />
            </LineChart>
            </ChartContainer> */}
            <div className="flex items-center justify-start gap-4">
              <Button
                onClick={() => router.back()}
                variant={"outline"}
                size={"icon"}
                className="rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-medium">{offer.name}</h1>
            </div>
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
              <div className="flex gap-2">
                <Button
                  onClick={() => refreshOffer()}
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
                  onClick={() => deleteOffer()}
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
