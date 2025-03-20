// utils/generateSlug.js
const generateSlug = (carName, id) => {
  const cleanedCarName = carName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing -

  return `${cleanedCarName}-${id}`;
};

export default generateSlug;
