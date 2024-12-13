import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function Filters({
  selectState,
  changeSelectHandler,
  customStates,
}: {
  selectState: string;
  changeSelectHandler: (filter: string) => void;
  customStates: { name: string; value: string }[];
}) {
  const selectedOption =
    customStates.find((state) => state.value === selectState)?.name || "";
  return (
    <Select value={selectState} onValueChange={changeSelectHandler}>
      <SelectTrigger>
        <SelectValue>{selectedOption}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {customStates.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
