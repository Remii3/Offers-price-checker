import OfferContent from "@/components/offer/OfferContent";
import { use } from "react";

export default function OfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const paramRdy = use(params);
  return (
    <>
      <h1>Test</h1>
      <OfferContent offerId={paramRdy.offerId} />
    </>
  );
}
