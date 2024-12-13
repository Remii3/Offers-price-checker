import OffersList from "@/components/offers/OffersList";

export default function Home() {
  return (
    <div className="h-full my-6">
      <section className="max-w-screen-2xl mx-auto px-4">
        <OffersList />
      </section>
    </div>
  );
}
