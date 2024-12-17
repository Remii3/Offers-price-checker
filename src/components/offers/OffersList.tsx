"use client";

import { Skeleton } from "../ui/skeleton";
import OfferItem from "./OfferItem";
import { Button } from "../ui/button";
import { OfferType } from "../../../types/types";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type OfferListProps = {
  isLoading: boolean;
  offersData?: {
    offers: OfferType[];
    totalOffers: number;
  };
  allOffers?: OfferType[];
  totalAvailable: number;
  totalFetched: number;
  error: Error | null;
  handleSkipChange: () => void;
  setAllOffers: Dispatch<SetStateAction<any[]>>;
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
  isLoading,
  error,
  allOffers,
  totalAvailable,
  handleSkipChange,
  setAllOffers,
  totalFetched,
}: OfferListProps) {
  return (
    <>
      {isLoading && <ListLoader />}
      {!isLoading && error && <ListError error={error} />}
      {!isLoading && allOffers && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-4">
            {allOffers.map((offer) => {
              return (
                <OfferItem
                  key={offer._id}
                  offer={offer}
                  setAllOffers={setAllOffers}
                />
              );
            })}
          </div>
          {totalFetched < totalAvailable && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleSkipChange} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
                  </>
                ) : (
                  "Show More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
