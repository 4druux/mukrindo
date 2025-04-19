// utils/formatDate.js

export const formatDisplayDate = (dateInput) => {
  if (!dateInput) {
    return "-";
  }

  try {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      console.warn("Invalid date input received:", dateInput);
      return typeof dateInput === "string" ? dateInput : "-";
    }

    const options = { year: "numeric", month: "long" };
    return date.toLocaleString("id-ID", options);
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
    return typeof dateInput === "string" ? dateInput : "-";
  }
};
