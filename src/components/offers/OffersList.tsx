"use client";

import { Skeleton } from "../ui/skeleton";
import OfferItem from "./OfferItem";
import { Button } from "../ui/button";
import { OfferType } from "../../../types/types";
type OfferListProps = {
  isFetching: boolean;
  isLoading: boolean;
  isRefreshingPrices: boolean;
  offerPages?: {
    pages: {
      offers: OfferType[];
    }[];
  };
  fetchNextPage: () => void;
  hasNextPage: boolean;
};
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

export default function OffersList({
  isFetching,
  isLoading,
  isRefreshingPrices,
  offerPages,
  fetchNextPage,
  hasNextPage,
}: OfferListProps) {
  return (
    <>
      {/* {(isFetching || isLoading || isRefreshingPrices) && <ListLoader />}
      {!isFetching && !isLoading && !isRefreshingPrices && error && (
        <ListError error={error} />
      )} */}
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
