"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";

const newOfferSchema = z.object({
  name: z.string(),
  url: z.string().url().min(1),
});

async function submitHandler(data: z.infer<typeof newOfferSchema>) {
  await axios.post("/api/offers", data);
}

export function useNewOfferForm() {
  // const { toast } = useToast();
  const { mutate: addOffer, isPending } = useMutation({
    mutationKey: ["newOffer"],
    mutationFn: async (data: z.infer<typeof newOfferSchema>) => {
      submitHandler(data);
    },
    onSuccess: () => {
      // toast("Offer created successfully", { type: "success" });
      console.log("Successfully added offer");
    },
  });

  const form = useForm({
    resolver: zodResolver(newOfferSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  return { form, addOffer, isPending };
}
