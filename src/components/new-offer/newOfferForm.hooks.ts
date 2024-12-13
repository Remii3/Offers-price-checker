"use client";

import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const newOfferSchema = z.object({
  name: z.string(),
  url: z.string().url().min(1),
});

async function submitHandler(
  data: z.infer<typeof newOfferSchema> & { userId: string }
) {
  await axios.post("/api/offers", data);
}

export function useNewOfferForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const { data: userData } = useSession();
  const queryCLient = useQueryClient();

  const { mutate: addOffer, isPending } = useMutation({
    mutationKey: ["newOffer"],
    mutationFn: async (data: z.infer<typeof newOfferSchema>) => {
      if (!userData) {
        return;
      }
      submitHandler({ ...data, userId: userData.user.id! });
    },
    onSuccess: () => {
      toast({ description: "Offer added." });
      form.reset();
      queryCLient.invalidateQueries({ queryKey: "offers" });
      if (!isAddingMultiple) {
        router.push(`/`);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(newOfferSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  function handleIsAddingMultiple() {
    setIsAddingMultiple((prev) => !prev);
  }

  return {
    form,
    addOffer,
    isPending,
    handleIsAddingMultiple,
    isAddingMultiple,
  };
}
