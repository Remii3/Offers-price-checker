import { useNewOfferForm } from "./newOfferForm.hooks";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function NewOfferForm() {
  const { form, addOffer, isPending } = useNewOfferForm();
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => addOffer(data))}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="url"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Url</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4">
            <Button type="submit" disabled={isPending}>
              <Loader2
                className={`${
                  isPending ? "block" : "hidden"
                } animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
              />
              <span className={`${isPending ? "invisible" : "visible"}`}>
                Add
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
