export const formatNumberWithSpaces = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    useGrouping: true,
  })
    .format(value)
    .replace(/,/g, " ");
};
