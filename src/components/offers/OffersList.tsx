"use client";

import {
  FILTER_STATES,
  SORT_STATES,
  useOffersList,
} from "./useOffersList.hooks";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import OfferItem from "./OfferItem";
import CustomSelect from "../features/CustomSelect";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { Input } from "../ui/input";

const ListLoader = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <Skeleton
        key={"loader" + index}
        className="w-full h-[376px] flex flex-col justify-top rounded-xl"
      >
        <div className="p-6">
          <Skeleton className="w-full h-[180px]" />
          <Skeleton className="w-full h-[16px] mt-2" />
        </div>
        <div className="p-6 pt-0 flex-grow space-y-2">
          <Skeleton className="w-full h-[16px]" />
          <Skeleton className="w-full h-[16px]" />
        </div>
        <div className="flex items-center p-6 pt-0 gap-4">
          <Skeleton className="w-full h-[36px]" />
        </div>
      </Skeleton>
    ))}
  </div>
);

const ListError = ({
  error,
}: {
  error: {
    message: string;
  };
}) => <div className="text-red-500 mt-4">{error.message}</div>;

export default function OffersList() {
  const {
    offerPages,
    isFetching,
    isLoading,
    error,
    changeFilterHandler,
    filtersState,
    changeSortHandler,
    sortState,
    refetchWithNewData,
    hasNextPage,
    fetchNextPage,
    isRefreshingPrices,
  } = useOffersList();
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-input pb-2">
        <h2 className="text-2xl font-medium">Offers:</h2>
        <div className="flex items-center gap-4">
          <form onSubmit={() => {}}>
            <Input />
            <Button variant={"outline"}>
              <span className="sm:inline hidden">Search</span>
              <Search className="h-6 w-6" />
            </Button>
          </form>
          <Button
            onClick={() => refetchWithNewData()}
            disabled={isRefreshingPrices}
          >
            <span className="sm:inline hidden">Refresh</span>
            <RefreshCw
              className={`${isRefreshingPrices && "animate-spin"} h-6 w-6`}
            />
          </Button>
          <Link
            href={"/new-offer"}
            className={`${buttonVariants({ variant: "outline" })} flex gap-2`}
          >
            <span className="sm:inline hidden">Add more</span>
            <PlusCircle className="h-6 w-6" />
          </Link>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <CustomSelect
            changeSelectHandler={changeFilterHandler}
            selectState={filtersState as keyof typeof offerPages}
            customStates={FILTER_STATES}
          />
        </div>
        <div>
          <CustomSelect
            changeSelectHandler={changeSortHandler}
            selectState={sortState}
            customStates={SORT_STATES}
          />
        </div>
      </div>
      {(isFetching || isLoading || isRefreshingPrices) && <ListLoader />}
      {!isFetching && !isLoading && !isRefreshingPrices && error && (
        <ListError error={error} />
      )}
      {!isFetching && !isLoading && !isRefreshingPrices && offerPages && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-4">
            {offerPages.pages.map((page, pageIndex) => {
              return page.offers.length > 0 ? (
                page.offers.map((offer) => (
                  <OfferItem key={offer._id} offer={offer} />
                ))
              ) : (
                <div
                  key={"notFound" + pageIndex}
                  className="text-center col-span-5 text-gray-500"
                >
                  No offers found
                </div>
              );
            })}
          </div>
          {hasNextPage && (
            <div className="mt-4 text-center">
              <Button
                variant={"outline"}
                onClick={() => fetchNextPage()}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
