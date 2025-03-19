// utils/formatNumber.js
export const formatNumber = (value, prefix = "") => {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  const stringValue = value.toString().replace(/\D/g, "");
  const formatted = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${prefix}${formatted}`;
};

export const unformatNumber = (formattedValue) => {
  if (typeof formattedValue !== "string") {
    return 0;
  }
  return parseInt(formattedValue.replace(/[^0-9]/g, ""), 10);
};
