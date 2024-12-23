import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FILTER_STATES } from "@/constants/constants";

type FilterSelectorProps = {
  filtersState: string;
  changeFilterHandler: (filter: string) => void;
};

export default function FilterSelector({
  filtersState,
  changeFilterHandler,
}: FilterSelectorProps) {
  return (
    <Select value={filtersState} onValueChange={changeFilterHandler}>
      <SelectTrigger>
        <SelectValue>
          {FILTER_STATES.find((state) => state.value === filtersState)?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FILTER_STATES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
