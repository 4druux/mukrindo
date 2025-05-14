// controllers/notificationController.js
const NotifStockRequest = require("../models/notifStockRequest");
const Notification = require("../models/notification");

// @desc    Create a new notification request
// @route   POST /api/notifications
// @access  Public
exports.createNotifStockRequest = async (req, res) => {
  try {
    // Ambil data dari body request (sesuai dengan field di NotifyMeForm onSubmit)
    const { brand, model, year, phoneNumber } = req.body;

    // Validasi dasar (meskipun frontend sudah validasi, backend tetap perlu)
    if (!brand || !model || !year || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Semua field (merek, model, tahun, nomor telepon) wajib diisi.",
      });
    }

    // Optional: Validasi format nomor telepon (misal: harus angka, panjang tertentu)
    if (!/^\d{9,15}$/.test(phoneNumber)) {
      // Contoh: 9-15 digit angka
      return res.status(400).json({
        success: false,
        message: "Format nomor telepon tidak valid.",
      });
    }

    // Buat instance model baru
    const newRequest = new NotifStockRequest({
      brand,
      model,
      year,
      phoneNumber,
      // status default 'Pending' sudah diatur di model
    });

    // Simpan ke database
    const savedRequest = await newRequest.save();

    // Buat notifikasi
    await Notification.create({
      type: "notifStock",
      requestId: savedRequest._id,
      preview: {
        model: `${brand} ${model} ${year}`,
        customer: phoneNumber,
      },
    });

    // Kirim response sukses
    res.status(201).json({
      success: true,
      data: savedRequest, // Kirim data yang disimpan jika perlu
    });
  } catch (error) {
    console.error("Error creating notification request:", error);
    // Handle error validasi Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid.",
        errors: messages,
      });
    }
    // Handle error lainnya
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal menyimpan permintaan notifikasi.",
    });
  }
};

// --- Opsional: Fungsi lain (mirip TradeIn) jika diperlukan untuk Admin ---

// @desc    Get all notification requests
// @route   GET /api/notifications
// @access  Private (Admin) - Perlu middleware otentikasi/otorisasi
exports.getAllNotifStockRequests = async (req, res) => {
  try {
    const requests = await NotifStockRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching notification requests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get single notification request by ID
// @route   GET /api/notifications/:id
// @access  Private (Admin)
exports.getNotifStockRequestById = async (req, res) => {
  try {
    const request = await NotifStockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Permintaan notifikasi tidak ditemukan",
      });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching single notification request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update notification request status
// @route   PATCH /api/notifications/:id/status
// @access  Private (Admin)
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
      { status: status }, // Hanya update status
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Permintaan notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status permintaan notifikasi berhasil diperbarui.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating notification status:", error);
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
      message: "Server Error: Gagal memperbarui status.",
    });
  }
};

// @desc    Delete notification request
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
exports.deleteNotifStockRequest = async (req, res) => {
  try {
    const request = await NotifStockRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Permintaan notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permintaan notifikasi berhasil dihapus.",
    });
  } catch (error) {
    console.error("Error deleting notification request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal menghapus permintaan.",
    });
  }
};
