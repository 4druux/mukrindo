// hooks/useExportData.js
import { useState, useRef, useEffect } from "react";
import { generatePDF, generateCSV } from "../utils/exportData";
import { toast } from "react-hot-toast";

export const useExportData = (exportDataFn) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target) &&
        !event.target.closest(".export-button")
      ) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    try {
      const data = exportDataFn();

      // Check if data is null or empty
      if (
        !data ||
        (data.pdf?.data?.length === 0 && data.csv?.data?.length === 0)
      ) {
        toast.error("Tidak ada data untuk periode yang dipilih.", {
          className: "custom-toast",
          duration: 5000,
        });
        return false;
      }

      if (type === "CSV") {
        generateCSV(data.csv);
      } else if (type === "PDF") {
        await generatePDF(data.pdf);
      }

      toast.success("Data berhasil diunduh!", {
        className: "custom-toast",
        duration: 5000,
      });
      return true;
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data. Silakan coba lagi.", {
        className: "custom-toast",
        duration: 5000,
      });
      return false;
    }
  };

  return { showExportMenu, setShowExportMenu, exportMenuRef, handleExport };
};
