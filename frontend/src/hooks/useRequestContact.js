// src/hooks/useRequestContact.js
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  const phoneStr = String(phoneNumber).replace(/\D/g, "");

  if (phoneStr.startsWith("0")) {
    return "62" + phoneStr.substring(1);
  }
  if (phoneStr.startsWith("62")) {
    return phoneStr;
  }
  if (phoneStr.match(/^[1-9]\d{8,13}$/)) {
    return "62" + phoneStr;
  }
  console.warn("Unrecognized phone number format:", phoneNumber);
  return phoneNumber;
};

const getInspectionLocationText = (locationType, constants) => {
  if (!locationType || !constants || Object.keys(constants).length === 0) {
    return "-";
  }
  if (locationType === constants.SHOWROOM) return "Showroom";
  if (locationType === constants.HOME) return "Rumah Pelanggan";
  return locationType;
};

const formatDate = (dateString) => {
  if (!dateString) return "(tanggal tidak diketahui)";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return "(tanggal tidak valid)";
  }
};

// --- Custom Hook Definition ---
export const useRequestContact = ({
  apiEndpoint,
  mutateList,
  handleFilterClick,
  requestType,
  statusConstants,
  locationConstants,
  companyName = "Mukrindo Motor",
}) => {
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  const generateWhatsAppMessage = (request) => {
    const customerName = request.customerName || "Pelanggan";
    let message = `Halo ${customerName},\n\nPerkenalkan, Kami dari tim ${companyName}.\n\n`;

    if (requestType === "tradeIn" || requestType === "buySell") {
      const inspectionDate = formatDate(request.inspectionDate);
      const inspectionTime =
        request.inspectionTime || "(Waktu belum ditentukan)";
      const inspectionLocationText = getInspectionLocationText(
        request.inspectionLocationType,
        locationConstants
      );
      const fullLocationDetail =
        request.inspectionLocationType === locationConstants?.SHOWROOM
          ? `Showroom kami di ${
              request.inspectionShowroomAddress || "(Alamat Showroom)"
            }`
          : `${request.inspectionFullAddress || ""}, ${
              request.inspectionCity || ""
            }, ${request.inspectionProvince || ""}`
              .replace(/ ,|, $/g, "")
              .trim() || "(Alamat Pelanggan)";

      let introMessage = "";
      if (requestType === "tradeIn") {
        introMessage = `Terima kasih sudah mengajukan permintaan tukar tambah yang Bapak/Ibu ajukan melalui website kami.`;
      } else {
        const carDetails = `${request.carBrand || ""} ${
          request.carModel || ""
        } ${request.carYear || ""}`.trim();
        introMessage = `Terima kasih sudah mengajukan permintaan jual mobil (${carDetails}) Bapak/Ibu melalui website kami.`;
      }

      message += `${introMessage}\n\n`;
      message += `Kami ingin mengonfirmasi jadwal inspeksi mobil Bapak/Ibu yang telah dijadwalkan pada:\n`;
      message += `    ��� Tanggal: ${inspectionDate}\n`;
      message += `    • Waktu: ${inspectionTime}\n`;
      message += `    • Lokasi: ${inspectionLocationText} (${fullLocationDetail})\n\n`;
      message += `Mohon konfirmasi kesesuaian jadwal ini.\n\n`;
    } else if (requestType === "notifyMe") {
      const carDetails =
        `${request.brand || ""} ${request.model || ""} (${
          request.year || ""
        })`.trim() || "mobil yang Anda cari";
      const requestDate = formatDate(request.createdAt);

      message += `Kami menghubungi Anda terkait permintaan notifikasi stok untuk mobil ${carDetails}, yang Anda ajukan pada tanggal ${requestDate} melalui website kami.\n\n`;
      message += `Apakah Anda masih berminat dengan mobil tersebut? Kami akan segera memberitahu Anda jika unit yang sesuai tersedia.\n\n`;
      message += `Mohon konfirmasinya agar kami dapat memberikan informasi terbaru.\n\n`;
    }

    message += `Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas pesan ini atau menghubungi kami.\n\n`;
    message += `Terima kasih, Hormat kami!\n`;
    message += `${companyName}`;

    return message;
  };

  const openWhatsApp = (request) => {
    const phoneField =
      requestType === "notifyMe" ? "phoneNumber" : "customerPhoneNumber";
    const phone = formatPhoneNumber(request[phoneField]);

    if (!phone) {
      console.warn(
        "Cannot open WhatsApp, phone number is missing for request:",
        request._id
      );
      toast.error("Nomor telepon tidak tersedia untuk membuka WhatsApp.");
      return;
    }

    const message = generateWhatsAppMessage(request);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  const handleContact = async (e, request, originalRequests) => {
    if (e) e.stopPropagation();

    const requestId = request._id;
    if (!requestId) {
      console.error("Request object missing _id:", request);
      toast.error("Terjadi kesalahan: ID permintaan tidak ditemukan.");
      return;
    }

    const phoneField =
      requestType === "notifyMe" ? "phoneNumber" : "customerPhoneNumber";
    const phoneNumber = request[phoneField];

    if (!phoneNumber) {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
      return;
    }

    if (request.status === statusConstants.PENDING) {
      setUpdatingRequestId(requestId);
      try {
        const updateResponse = await axios.patch(
          `${apiEndpoint}/${requestId}`,
          { status: statusConstants.CONTACTED }
        );

        if (updateResponse.data?.success) {
          if (mutateList && Array.isArray(originalRequests)) {
            const updatedData = originalRequests.map((req) =>
              req._id === requestId
                ? { ...req, status: statusConstants.CONTACTED }
                : req
            );
            mutateList({ success: true, data: updatedData }, false);
          } else if (mutateList) {
            mutateList();
          }

          toast.success("Status berhasil diperbarui ke Dihubungi!", {
            className: "custom-toast",
          });

          if (handleFilterClick) {
            handleFilterClick("status", statusConstants.CONTACTED);
          }

          openWhatsApp(request);
        } else {
          throw new Error(
            updateResponse.data?.message || "Gagal memperbarui status dari API."
          );
        }
      } catch (updateError) {
        console.error(
          `Failed to update status for ${requestType} request (${requestId}):`,
          updateError
        );
        const errorMessage =
          updateError.response?.data?.message ||
          updateError.message ||
          "Gagal memperbarui status. Silakan coba lagi.";
        toast.error(errorMessage, { className: "custom-toast" });
        if (mutateList) mutateList();
      } finally {
        setUpdatingRequestId(null);
      }
    } else {
      openWhatsApp(request);
    }
  };

  return { handleContact, updatingRequestId };
};
