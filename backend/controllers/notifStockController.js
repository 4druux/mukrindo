const NotifStockRequest = require("../models/notifStockRequest");
const Notification = require("../models/notification");
const { sendNotificationEmail } = require("../services/emailService");

exports.createNotifStockRequest = async (req, res) => {
  try {
    const requestData = req.body;
    const newRequest = new NotifStockRequest(requestData);
    const savedRequest = await newRequest.save();

    await Notification.create({
      type: "notifStock",
      requestId: savedRequest._id,
      preview: {
        model: `${savedRequest.notifStockBrand} ${savedRequest.notifStockModel} ${savedRequest.notifStockYear}`,
        customer: savedRequest.customerPhoneNumber,
      },
    });

    await sendNotificationEmail("notifStock", {
      model: `${savedRequest.notifStockBrand} ${savedRequest.notifStockModel} ${savedRequest.notifStockYear}`,
      customer: savedRequest.customerPhoneNumber,
    });

    res.status(201).json({
      success: true,
      message: "Permintaan notifikasi stok berhasil dibuat.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating stock notification request:", error);
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
      message: "Server Error: Gagal membuat permintaan notifikasi stok.",
    });
  }
};

exports.getAllNotifStockRequests = async (req, res) => {
  try {
    const requests = await NotifStockRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching stock notification requests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal mengambil permintaan notifikasi stok.",
    });
  }
};

exports.getNotifStockRequestById = async (req, res) => {
  try {
    const request = await NotifStockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Permintaan notifikasi stok tidak ditemukan",
      });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching single stock notification request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal mengambil permintaan notifikasi stok.",
    });
  }
};

exports.updateNotifStockRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Dihubungi"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Harus salah satu dari: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const updatedRequest = await NotifStockRequest.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Permintaan notifikasi stok tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status permintaan notifikasi berhasil diperbarui.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating stock notification status:", error);
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

exports.deleteNotifStockRequest = async (req, res) => {
  try {
    const request = await NotifStockRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Permintaan notifikasi stok tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permintaan notifikasi stok berhasil dihapus.",
    });
  } catch (error) {
    console.error("Error deleting stock notification request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal menghapus permintaan notifikasi stok.",
    });
  }
};
