"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
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
  console.log("Inside:", offerId);
  const { offer, isPending, refreshOffer, isRefreshing } = useOfferContent({
    offerId,
  });
  console.log("OFfer", offer, isPending);
  const router = useRouter();
  return (
    <div className="flex flex-col pt-8 h-full max-w-screen-lg mx-auto relative">
      {isPending && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
      {!isPending && offer && (
        <>
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              variant={"outline"}
              size={"icon"}
              className="rounded-full"
            >
              <ArrowLeft />
            </Button>
          </div>
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
            <h1 className="text-xl font-medium">{offer.name}</h1>
            <div>
              <p>
                Current price:
                <span className="font-medium">{offer.currentPrice}</span>
              </p>
              <div>
                <ul>
                  {offer.lastPrices.map((price, i) => (
                    <li key={price + "price" + i}>{price}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Button
                  onClick={() => refreshOffer()}
                  size={"sm"}
                  disabled={isRefreshing}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
