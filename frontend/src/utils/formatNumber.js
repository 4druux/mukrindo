// utils/formatNumber.js

export const formatNumber = (value, prefix = "") => {
  if (value === null || value === undefined) {
    return prefix;
  }

  const stringValueInput = value.toString();
  const cleanedString = stringValueInput.replace(/\D/g, "");

  if (cleanedString === "") {
    return prefix;
  }

  const num = Number(cleanedString);

  if (isNaN(num)) {
    return prefix;
  }

  const stringValueNum = num.toString();
  const formatted = stringValueNum.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${prefix}${formatted}`;
};

export const unformatNumber = (formattedValue) => {
  if (typeof formattedValue !== "string") {
    return 0;
  }
  const cleaned = formattedValue.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
};
