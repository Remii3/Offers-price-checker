"use client";

import OffersList from "@/components/offers/OffersList";
import { useHome } from "@/app/useHome.hooks";
import { Input } from "@/components/ui/input";
import { PlusCircle, RefreshCw, Search, Trash } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import FilterSelector from "@/components/offers/FilterSelector";
import SortSelector from "@/components/offers/SortSelector";

export default function Home() {
  const {
    offerPagesIsLoading,
    filtersState,
    sortState,
    handleRefreshOffers,
    refreshOffersIsLoading,
    search,
    handleSearchChange,
    handleDeleteAllOffers,
    deleteAllOffersIsLoading,
    offerPagesError,
    allOffers,
    totalAvailable,
    totalFetched,
    handleFilterChange,
    handleSortChange,
    loadMoreOffers,
    setAllOffers,
    setSkip,
  } = useHome();
  return (
    <div className="h-full mb-4">
      <section className="max-w-screen-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-white py-4 px-4 border-b border-b-input">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <div className="flex gap-2 relative w-full">
                <Input
                  className={`flex-grow w-full transition-all ease-in-out pr-12`}
                  placeholder="Offer name"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  value={search}
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 py-1">
                  <Search className="h-5 w-5" />
                </div>
              </div>
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
        <div className="px-4 mt-4 flex justify-between">
          <div className="flex gap-4">
            <FilterSelector
              filtersState={filtersState}
              changeFilterHandler={handleFilterChange}
            />
            {!offerPagesIsLoading && (
              <Button
                variant={"destructive"}
                disabled={deleteAllOffersIsLoading}
                onClick={() => handleDeleteAllOffers()}
              >
                <Trash />
                <span>Delete all</span>
              </Button>
            )}
          </div>
          <div>
            <SortSelector
              changeSortHandler={handleSortChange}
              sortsState={sortState}
            />
          </div>
        </div>
        <div className="px-4">
          <OffersList
            isLoading={offerPagesIsLoading}
            error={offerPagesError}
            allOffers={allOffers}
            totalAvailable={totalAvailable}
            totalFetched={totalFetched}
            handleSkipChange={loadMoreOffers}
            setAllOffers={setAllOffers}
            setSkip={setSkip}
          />
        </div>
      </section>
    </div>
  );
}
