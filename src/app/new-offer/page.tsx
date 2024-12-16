"use client";
import NewOfferForm from "@/components/new-offer/NewOfferForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewOfferPage() {
  const router = useRouter();
  return (
    <div className="flex items-center h-full pb-14 px-4 relative">
      <section className="max-w-screen-lg mx-auto w-full">
        <div className="relative">
          <Button
            onClick={() => router.back()}
            variant={"outline"}
            size={"icon"}
            className="absolute top-0 left-0 rounded-full"
          >
            <ArrowLeft />
          </Button>
          <h2 className="text-2xl font-medium text-center mb-4">
            Follow new offer
          </h2>
        </div>
        <NewOfferForm />
      </section>
    </div>
  );
}
