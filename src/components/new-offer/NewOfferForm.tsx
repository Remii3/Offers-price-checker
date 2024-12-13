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
import { Button, buttonVariants } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import Link from "next/link";

export default function NewOfferForm() {
  const {
    form,
    addOffer,
    isPending,
    handleIsAddingMultiple,
    isAddingMultiple,
  } = useNewOfferForm();

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
          <div className="flex space-x-2">
            <Checkbox
              id="terms1"
              checked={isAddingMultiple}
              onCheckedChange={handleIsAddingMultiple}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="terms1">Multiple offers</Label>
              <p className="text-sm text-muted-foreground">
                Select if you&apos;re going to add multiple urls.
              </p>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-4">
            <Link
              href="/"
              className={`${buttonVariants({
                variant: "outline",
              })}`}
            >
              Back
            </Link>
            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                <Loader2
                  className={`${
                    isPending ? "block" : "hidden"
                  } animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
                />
                <span className={`${isPending ? "invisible" : "visible"}`}>
                  Follow
                </span>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
