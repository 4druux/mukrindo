// controllers/tradeInController.js

const TradeInRequest = require("../models/tradeInRequest");
const Notification = require("../models/notification");
const { sendNotificationEmail } = require("../services/emailService");

exports.createTradeInRequest = async (req, res) => {
  try {
    const requestData = req.body;

    const newRequest = new TradeInRequest(requestData);

    const savedRequest = await newRequest.save();

    await Notification.create({
      type: "tradeIn",
      requestId: savedRequest._id,
      preview: {
        model: `${savedRequest.tradeInBrand} ${savedRequest.tradeInModel} ${savedRequest.tradeInYear}`,
        customer: `${savedRequest.customerName} - ${savedRequest.customerPhoneNumber}`,
      },
    });

    await sendNotificationEmail("tradeIn", {
      model: `${savedRequest.tradeInBrand} ${savedRequest.tradeInModel} ${savedRequest.tradeInYear}`,
      customer: `${savedRequest.customerName} - ${savedRequest.customerPhoneNumber}`,
    });

    res.status(201).json({
      success: true,
      message: "Permintaan tukar tambah berhasil dibuat.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating trade-in request:", error);
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
      message: "Server Error: Gagal membuat permintaan tukar tambah.",
    });
  }
};

exports.getAllTradeInRequests = async (req, res) => {
  try {
    const requests = await TradeInRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching trade-in requests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTradeInRequestById = async (req, res) => {
  try {
    const request = await TradeInRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching single trade-in request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateTradeInStatus = async (req, res) => {
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

    const updatedRequest = await TradeInRequest.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "Status permintaan berhasil diperbarui.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating trade-in status:", error);
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
