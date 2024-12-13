import NewOfferForm from "@/components/new-offer/NewOfferForm";

export default function NewOfferPage() {
  return (
    <div className="flex items-center h-full pb-14 px-4">
      <section className="max-w-screen-lg mx-auto w-full">
        <h2 className="text-2xl font-medium text-center mb-4">
          Follow new offer
        </h2>
        <NewOfferForm />
      </section>
    </div>
  );
}
