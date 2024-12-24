"use client";

import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useNewOffer } from "./useNewOffer.hooks";

export default function NewOfferPage() {
  const router = useRouter();
  const { form, addOffer, isPending, handleCheckNew } = useNewOffer();

  return (
    <div className="flex items-center h-full pb-14 px-4 relative">
      <section className="max-w-screen-lg mx-auto w-full">
        <div className="relative">
          <Link
            href="#"
            onClick={() => router.back()}
            className={`${buttonVariants({
              variant: "outline",
              size: "icon",
            })} absolute top-0 left-0`}
          >
            <ArrowLeft />
          </Link>
          <h2 className="text-2xl font-medium text-center mb-4">
            Follow new offer
          </h2>
        </div>
        <Form {...form}>
          <form
            className="space-y-2"
            onSubmit={form.handleSubmit((data) => addOffer(data))}
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom name to help you recognize the offer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="url"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Url <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Url of the offer you want to follow
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2 flex justify-end gap-4">
              <Button
                type="button"
                onClick={handleCheckNew}
                variant={"outline"}
              >
                Check new
              </Button>
              <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                  <Loader2
                    className={`${
                      isPending ? "block" : "hidden"
                    } animate-spin absolute`}
                  />
                  <span
                    className={`${
                      isPending ? "invisible" : "visible"
                    } flex gap-1 items-center`}
                  >
                    Follow <Plus />
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}
