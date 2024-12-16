"use client";

import OffersList from "@/components/offers/OffersList";
import { useHome } from "./useHome.hooks";
import { Input } from "@/components/ui/input";
import { PlusCircle, RefreshCw, Search, Trash } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import FilterSelector from "@/components/offers/FilterSelector";
import SortSelector from "@/components/offers/SortSelector";

export default function Home() {
  const {
    offerPages,
    isFetching,
    isLoading,
    changeFilterHandler,
    filtersState,
    changeSortHandler,
    sortState,
    handleRefreshOffers,
    hasNextPage,
    fetchNextPage,
    refreshOffersIsLoading,
    handleSearch,
    search,
    handleSearchChange,
    handleDeleteAllOffers,
    deleteAllIsLoading,
  } = useHome();

  return (
    <div className="h-full my-4">
      <section className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between gap-2 border-b border-input pb-4">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <form
                onSubmit={handleSearch}
                className="flex gap-2 relative w-full"
              >
                <Input
                  className={`flex-grow w-full transition-all ease-in-out pr-12`}
                  placeholder="Offer name"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  value={search}
                />
                <button
                  type="submit"
                  className="absolute top-1/2 right-3 -translate-y-1/2 py-1"
                >
                  <Search className="h-6 w-6" />
                </button>
              </form>
            </div>
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => handleRefreshOffers()}
                disabled={refreshOffersIsLoading}
              >
                <span className="sm:inline hidden">Refresh</span>
                <RefreshCw
                  className={`${
                    refreshOffersIsLoading && "animate-spin"
                  } h-6 w-6`}
                />
              </Button>
              <Link
                href={"/new-offer"}
                className={`${buttonVariants({
                  variant: "outline",
                })} flex gap-2`}
              >
                <span className="sm:inline hidden">Add more</span>
                <PlusCircle className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <div className="flex gap-4">
            <FilterSelector
              filtersState={filtersState}
              changeFilterHandler={changeFilterHandler}
            />
            {filtersState === "deleted" && (
              <Button
                variant={"destructive"}
                disabled={
                  deleteAllIsLoading ||
                  (offerPages && offerPages.pages[0].totalOffers <= 0)
                }
                onClick={() => handleDeleteAllOffers()}
              >
                <Trash />
                <span>Delete all</span>
              </Button>
            )}
          </div>
          <div>
            <SortSelector
              changeSortHandler={changeSortHandler}
              sortsState={sortState}
            />
          </div>
        </div>
        <OffersList
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          isLoading={isLoading}
          isRefreshingPrices={refreshOffersIsLoading}
          offerPages={offerPages}
        />
      </section>
    </div>
  );
}
