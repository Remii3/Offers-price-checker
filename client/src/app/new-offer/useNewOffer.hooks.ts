"use client";

import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const newOfferSchema = z.object({
  name: z.string(),
  url: z.string().url().min(1),
});

export function useNewOffer() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: userData } = useSession();
  const searchParams = useSearchParams();

  const { mutate: addOffer, isPending } = useMutation({
    mutationKey: ["newOffer"],
    mutationFn: async ({
      data,
      userId,
    }: {
      userId: string;
      data: z.infer<typeof newOfferSchema>;
    }) => {
      const res = await axios.post("/offers", { ...data, userId });

      return res.data;
    },
    onSuccess: async () => {
      form.reset();
      toast({ title: "Success", description: "Offer added." });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Error adding offer: ", error.message);
        toast({
          title: "Error",
          description: error.response?.data.message || "Failed to add offer",
          variant: "destructive",
        });
      } else {
        console.error("Error adding offer: ", error);
        toast({
          title: "Error",
          description: error.message || "Failed to add offer",
          variant: "destructive",
        });
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

  function handleAddOffer(data: z.infer<typeof newOfferSchema>) {
    if (userData?.user.id) {
      addOffer({ data, userId: userData.user.id });
    }
  }

  function handleCheckNew() {
    const url = new URLSearchParams(searchParams.toString());

    url.set("filter", "new");
    url.set("sort", localStorage.getItem("sort") || "oldest");
    router.push(`/?${url.toString()}`, { scroll: false });
  }

  return {
    form,
    addOffer: handleAddOffer,
    isPending,
    router,
    handleCheckNew,
  };
}
