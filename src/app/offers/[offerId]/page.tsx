import OfferContent from "@/components/offer/OfferContent";
import { use } from "react";

export default function OfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const paramRdy = use(params);
  console.log("params", paramRdy);
  return (
    <>
      <h1>Test</h1>
      <OfferContent offerId={paramRdy.offerId} />
    </>
  );
}
