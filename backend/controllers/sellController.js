const SellRequest = require("../models/sellRequest");
const Notification = require("../models/notification");
const { sendNotificationEmail } = require("../services/emailService");

exports.createSellRequest = async (req, res) => {
  try {
    const requestData = req.body;
    const newRequest = new SellRequest(requestData);
    const savedRequest = await newRequest.save();

    await Notification.create({
      type: "buySell",
      requestId: savedRequest._id,
      preview: {
        model: `${savedRequest.buySellBrand} ${savedRequest.buySellModel} ${savedRequest.buySellYear}`,
        customer: `${savedRequest.customerName} - ${savedRequest.customerPhoneNumber}`,
      },
    });

    await sendNotificationEmail("buySell", {
      model: `${savedRequest.buySellBrand} ${savedRequest.buySellModel} ${savedRequest.buySellYear}`,
      customer: `${savedRequest.customerName} - ${savedRequest.customerPhoneNumber}`,
    });

    res.status(201).json({
      success: true,
      message: "Permintaan jual mobil berhasil dibuat.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating sell request:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid.",
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal membuat permintaan jual mobil.",
    });
  }
};

exports.getAllSellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching sell requests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal mengambil permintaan jual mobil.",
    });
  }
};

exports.getSellRequestById = async (req, res) => {
  try {
    const request = await SellRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Permintaan jual mobil tidak ditemukan",
      });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching single sell request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal mengambil permintaan jual mobil.",
    });
  }
};

exports.updateSellRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Dihubungi", "Selesai", "Dibatalkan"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Harus salah satu dari: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const updatedRequest = await SellRequest.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Permintaan jual mobil tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status permintaan berhasil diperbarui.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating sell request status:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid.",
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal memperbarui status permintaan.",
    });
  }
};
