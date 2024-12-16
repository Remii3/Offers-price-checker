import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SORT_STATES } from "@/constants/constants";

type SortSelectorProps = {
  sortsState: string;
  changeSortHandler: (sort: string) => void;
};

export default function SortSelector({
  changeSortHandler,
  sortsState,
}: SortSelectorProps) {
  return (
    <Select value={sortsState} onValueChange={changeSortHandler}>
      <SelectTrigger>
        <SelectValue>
          {SORT_STATES.find((state) => state.value === sortsState)?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SORT_STATES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
