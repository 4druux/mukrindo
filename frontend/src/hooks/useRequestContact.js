import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  if (phoneNumber.startsWith("0")) {
    return "62" + phoneNumber.substring(1);
  }
  if (phoneNumber.startsWith("62")) {
    return phoneNumber;
  }
  return "62" + phoneNumber;
};

const getInspectionLocationText = (locationType, constants) => {
  if (!locationType) return "-";
  if (locationType === constants.SHOWROOM) return "Showroom";
  if (locationType === constants.HOME) return "Rumah Pelanggan";
  return locationType;
};

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

  const openWhatsApp = (request) => {
    const phone = formatPhoneNumber(request.customerPhoneNumber);
    if (!phone) {
      console.warn("Cannot open WhatsApp, phone number is missing.");
      return;
    }

    const customerName = request.customerName || "Pelanggan";
    const inspectionDate = request.inspectionDate
      ? new Date(request.inspectionDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "(Tanggal belum ada)";
    const inspectionTime = request.inspectionTime || "(Waktu belum ditentukan)";
    const inspectionLocationText = getInspectionLocationText(
        request.inspectionLocationType,
        locationConstants
    );
    const fullLocationDetail =
      request.inspectionLocationType === locationConstants.SHOWROOM
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
    } else if (requestType === "buySell") {
      const carDetails = `${request.carBrand || ""} ${
        request.carModel || ""
      } ${request.carYear || ""}`.trim();
      introMessage = `Terima kasih sudah mengajukan permintaan jual mobil (${carDetails}) Bapak/Ibu melalui website kami.`;
    }

    let message = `Halo Bapak/Ibu ${customerName},\n\n`;
    message += `Perkenalkan, Kami dari tim ${companyName}. ${introMessage}\n\n`;
    message += `Kami ingin mengonfirmasi jadwal inspeksi mobil Bapak/Ibu yang telah dijadwalkan pada:\n`;
    message += `    • Tanggal: ${inspectionDate}\n`;
    message += `    • Waktu: ${inspectionTime}\n`;
    message += `    • Lokasi: ${inspectionLocationText} (${fullLocationDetail})\n\n`;
    message += `Mohon konfirmasi kesesuaian jadwal ini.\n\n`;
    message += `Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas pesan ini atau menghubungi kami.\n\n`;
    message += `Terima kasih, Hormat kami!\n`;
    message += `${companyName}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  const handleContact = async (e, request, originalRequests) => {
    if (e) e.stopPropagation();

    const requestId = request._id;
    const currentStatus = request.status;
    const phoneNumber = request.customerPhoneNumber;

    if (!phoneNumber) {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
      return;
    }

    if (currentStatus === statusConstants.PENDING) {
      setUpdatingRequestId(requestId);
      try {
        const updateResponse = await axios.patch(
          `${apiEndpoint}/${requestId}`,
          { status: statusConstants.CONTACTED }
        );

        if (updateResponse.data && updateResponse.data.success) {
          const updatedOriginalRequests = originalRequests.map((req) =>
            req._id === requestId
              ? { ...req, status: statusConstants.CONTACTED }
              : req
          );
          mutateList({ success: true, data: updatedOriginalRequests }, false);

          toast.success("Status berhasil diperbarui!", {
            className: "custom-toast",
          });

          if (handleFilterClick) {
             handleFilterClick("status", statusConstants.CONTACTED);
          }

          openWhatsApp(request);

        } else {
          throw new Error(
            updateResponse.data.message || "Gagal memperbarui status."
          );
        }
      } catch (updateError) {
        console.error(`Failed to update status for ${requestType} request:`, updateError);
        const errorMessage =
          updateError.response?.data?.message ||
          updateError.message ||
          "Gagal memperbarui status.";
        toast.error(errorMessage, { className: "custom-toast" });
        mutateList();
      } finally {
        setUpdatingRequestId(null);
      }
    } else {
      openWhatsApp(request);
    }
  };

  return { handleContact, updatingRequestId };
};