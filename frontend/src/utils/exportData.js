// utils/exportUtils.js
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const generatePDF = async ({
  title,
  data,
  columns,
  summaryData,
  logoUrl = "/images/logo/mm-logo.png",
  fileName,
  periodeText,
}) => {
  try {
    const jsPDFModule = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const doc = new jsPDFModule.default();
    const autoTable = autoTableModule.default;

    const pageMargin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    let headerStartY = 15;
    let textBlockY = headerStartY;
    const lineSpacing = 2;
    const textStartX = pageMargin;
    let accumulatedTextHeight = 0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const title1 = "Mukrindo Motor";
    const title1Dim = doc.getTextDimensions(title1, { fontSize: 14 });
    doc.text(title1, textStartX, textBlockY + title1Dim.h);
    accumulatedTextHeight = title1Dim.h;

    doc.setFontSize(12);
    doc.setFont("helvetica");
    const title2 = title;
    const title2Dim = doc.getTextDimensions(title2, { fontSize: 12 });
    doc.text(
      title2,
      textStartX,
      textBlockY + accumulatedTextHeight + lineSpacing + title2Dim.h
    );
    accumulatedTextHeight += lineSpacing + title2Dim.h;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const periodeTextDim = doc.getTextDimensions(periodeText, {
      fontSize: 10,
    });
    doc.text(
      periodeText,
      textStartX,
      textBlockY + accumulatedTextHeight + lineSpacing + periodeTextDim.h
    );
    accumulatedTextHeight += lineSpacing + periodeTextDim.h;

    const totalTextBlockHeight = accumulatedTextHeight;
    let headerBottomY = headerStartY + totalTextBlockHeight;

    try {
      const response = await fetch(logoUrl);
      if (response.ok) {
        const blob = await response.blob();
        const logoImgData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        img.src = logoImgData;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        if (img.width > 0 && img.height > 0) {
          const aspectRatio = img.width / img.height;
          const pdfLogoHeight = 12;
          const pdfLogoWidth = pdfLogoHeight * aspectRatio;
          const logoX = pageWidth - pageMargin - pdfLogoWidth;
          const logoY = headerStartY;
          doc.addImage(
            logoImgData,
            "PNG",
            logoX,
            logoY,
            pdfLogoWidth,
            pdfLogoHeight
          );
          headerBottomY = Math.max(headerBottomY, logoY + pdfLogoHeight);
        }
      }
    } catch (e) {
      console.error("Error loading logo:", e);
    }

    const tableStartY = headerBottomY + 10;

    autoTable(doc, {
      startY: tableStartY,
      head: [columns],
      body: data,
      theme: "plain",
      styles: {
        fontSize: 9,
        font: "helvetica",
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        valign: "middle",
      },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: pageMargin, right: pageMargin },
    });

    const finalYOfMainTable = doc.lastAutoTable.finalY || tableStartY;
    const gapAfterTable = 8;
    const lineY = finalYOfMainTable + gapAfterTable;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(pageMargin, lineY, pageWidth - pageMargin, lineY);

    const summaryTableStartY = lineY + 5;

    if (summaryData && summaryData.length > 0) {
      autoTable(doc, {
        startY: summaryTableStartY,
        body: summaryData,
        theme: "plain",
        tableWidth: pageWidth - 2 * pageMargin,
        styles: {
          fontSize: 10,
          font: "helvetica",
          cellPadding: { top: 3, right: 5, bottom: 3, left: 5 },
          textColor: [31, 41, 55],
        },
        columnStyles: {
          0: { halign: "left", fontStyle: "normal" },
          1: { halign: "right", fontStyle: "bold" },
        },
        margin: { left: pageMargin, right: pageMargin },
        pageBreak: "avoid",
      });
    }

    doc.save(fileName);
    return true;
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
  }
};

export const generateCSV = ({ headers, data, fileName }) => {
  const csvContent = [
    headers.join(","),
    ...data.map((item) => item.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
