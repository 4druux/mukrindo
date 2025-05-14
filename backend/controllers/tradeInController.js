const TradeInRequest = require("../models/tradeInRequest");
const Notification = require("../models/notification");

// @desc    Create a new trade-in request
// @route   POST /api/trade-in
// @access  Public
exports.createTradeInRequest = async (req, res) => {
  try {
    // Ambil data dari body request
    const requestData = req.body;

    // Buat instance model baru
    const newRequest = new TradeInRequest(requestData);

    // Simpan ke database
    const savedRequest = await newRequest.save();

    await Notification.create({
      type: "tradeIn",
      requestId: savedRequest._id,
      preview: {
        model: `${req.body.tradeInBrand} ${req.body.tradeInModel} ${req.body.tradeInYear}`,
        customer: `${req.body.customerName} - ${req.body.customerPhoneNumber}`,
      },
    });

    // Kirim response sukses
    res.status(201).json({
      success: true,
      message: "Permintaan tukar tambah berhasil dibuat.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating trade-in request:", error);
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
      message: "Server Error: Gagal membuat permintaan tukar tambah.",
    });
  }
};

// --- Opsional: Tambahkan fungsi lain jika perlu ---

// @desc    Get all trade-in requests (Mungkin untuk Admin)
// @route   GET /api/trade-in
// @access  Private (Harus ditambahkan autentikasi/autorisasi)
exports.getAllTradeInRequests = async (req, res) => {
  try {
    const requests = await TradeInRequest.find().sort({ createdAt: -1 }); // Urutkan terbaru dulu
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

// @desc    Get single trade-in request by ID (Mungkin untuk Admin)
// @route   GET /api/trade-in/:id
// @access  Private
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
    const { id } = req.params; // Ambil ID dari parameter URL
    const { status } = req.body; // Ambil status baru dari body request

    // 1. Validasi Input Status (Penting!)
    const allowedStatuses = ["Pending", "Dihubungi", "Selesai", "Dibatalkan"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Harus salah satu dari: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    // 2. Cari dan Update Request di Database
    // Menggunakan findByIdAndUpdate untuk efisiensi
    // { new: true } -> mengembalikan dokumen *setelah* diupdate
    // { runValidators: true } -> memastikan update mematuhi schema (misal enum status)
    const updatedRequest = await TradeInRequest.findByIdAndUpdate(
      id,
      { status: status }, // Hanya update field status
      { new: true, runValidators: true }
    );

    // 3. Handle Jika Request Tidak Ditemukan
    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
    }

    // 4. Kirim Response Sukses dengan Data yang Sudah Diupdate
    res.status(200).json({
      success: true,
      message: "Status permintaan berhasil diperbarui.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating trade-in status:", error);
    // Handle error validasi Mongoose (jika runValidators gagal)
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
      message: "Server Error: Gagal memperbarui status permintaan.",
    });
  }
};
