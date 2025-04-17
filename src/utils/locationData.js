// src/utils/locationData.js

export const showroomOptions = [
  {
    value: "Mukrindo Motor - Tangerang Selatan",
    label: "Mukrindo Motor - Tangerang Selatan",
  },
];

export const timeSlotOptions = [
  { value: "09:00-12:00", label: "09:00 - 12:00" },
  { value: "12:00-15:00", label: "12:00 - 15:00" },
  { value: "15:00-18:00", label: "15:00 - 18:00" },
];

export const provinceOptions = [
  { value: "DKI Jakarta", label: "DKI Jakarta" },
  { value: "Banten", label: "Banten" },
  { value: "Jawa Barat", label: "Jawa Barat" },
];

export const cityData = {
  "DKI Jakarta": [
    { value: "Jakarta Pusat", label: "Jakarta Pusat" },
    { value: "Jakarta Utara", label: "Jakarta Utara" },
    { value: "Jakarta Selatan", label: "Jakarta Selatan" },
    { value: "Jakarta Barat", label: "Jakarta Barat" },
    { value: "Jakarta Timur", label: "Jakarta Timur" },
  ],
  Banten: [
    { value: "Tangerang", label: "Tangerang" },
    { value: "Tangerang Selatan", label: "Tangerang Selatan" },
    { value: "Serang", label: "Serang" },
    { value: "Cilegon", label: "Cilegon" },
  ],
  "Jawa Barat": [
    { value: "Bekasi", label: "Bekasi" },
    { value: "Depok", label: "Depok" },
    { value: "Bogor", label: "Bogor" },
  ],
};

export const getCityOptions = (province) => {
  return cityData[province] || [];
};
