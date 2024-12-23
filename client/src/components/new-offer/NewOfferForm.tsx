"use client";

import { useNewOfferForm } from "./newOfferForm.hooks";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";

export default function NewOfferForm() {
  const { form, addOffer, isPending, handleCheckNew } = useNewOfferForm();

  return (
    <>
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
            <Button type="button" onClick={handleCheckNew} variant={"outline"}>
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
    </>
  );
}
