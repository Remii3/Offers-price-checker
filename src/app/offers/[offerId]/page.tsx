import OfferContent from "@/components/offer/OfferContent";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const rdyParams = await params;

  return (
    <>
      <OfferContent offerId={rdyParams.offerId} />
    </>
  );
}
