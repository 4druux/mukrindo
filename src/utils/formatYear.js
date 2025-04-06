// utils/formatYear.js
export const formatYear = (value) => {
  if (!value) return "";
  return value.toString().replace(/\D/g, "").slice(0, 4);
};

export const isValidYear = (year, min, max) => {
  if (!year) return false;
  const num = parseInt(year, 10);
  return num >= min && num <= max;
};
