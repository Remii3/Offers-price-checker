import OffersList from "@/components/offers/OffersList";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="h-full my-6">
      <section className="max-w-screen-2xl mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <OffersList />
        </Suspense>
      </section>
    </div>
  );
}
