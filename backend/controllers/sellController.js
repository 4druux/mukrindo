const SellRequest = require("../models/sellRequest");
const Notification = require("../models/notification");
const { sendNotificationEmail } = require("../services/emailService");

// @desc    Create a new sell request
// @route   POST /api/sell-requests
// @access  Public
exports.createSellRequest = async (req, res) => {
  try {
    // Ambil data dari body request
    // Map nama field dari frontend (BuySellCar.js) ke model (SellRequestSchema)
    const {
      brand,
      model,
      variant,
      year,
      transmission,
      stnkExpiry,
      color,
      travelDistance,
      price, // Data mobil
      name,
      phoneNumber,
      email, // Data kontak
      inspectionLocationType,
      showroomAddress,
      province,
      city,
      fullAddress,
      inspectionDate,
      inspectionTime, // Data inspeksi
    } = req.body;

    // Buat objek data sesuai dengan skema SellRequest
    const requestData = {
      carBrand: brand,
      carModel: model,
      carVariant: variant,
      carYear: year,
      carTransmission: transmission,
      carStnkExpiry: stnkExpiry,
      carColor: color,
      carTravelDistance: travelDistance,
      carPrice: price,
      customerName: name,
      customerPhoneNumber: phoneNumber, // Pastikan sudah di-unformat di frontend sebelum dikirim
      customerEmail: email,
      inspectionLocationType,
      inspectionShowroomAddress:
        inspectionLocationType === "showroom" ? showroomAddress : undefined,
      inspectionProvince:
        inspectionLocationType === "rumah" ? province : undefined,
      inspectionCity: inspectionLocationType === "rumah" ? city : undefined,
      inspectionFullAddress:
        inspectionLocationType === "rumah" ? fullAddress : undefined,
      inspectionDate,
      inspectionTime,
      // status default 'Pending' akan otomatis ditambahkan oleh Mongoose
    };

    // Hapus properti undefined secara eksplisit jika perlu (Mongoose biasanya mengabaikannya)
    Object.keys(requestData).forEach(
      (key) => requestData[key] === undefined && delete requestData[key]
    );

    // Buat instance model baru
    const newRequest = new SellRequest(requestData);

    // Simpan ke database
    const savedRequest = await newRequest.save();

    await Notification.create({
      type: "buySell",
      requestId: savedRequest._id,
      preview: {
        model: `${brand} ${model} ${year}`,
        customer: `${name} - ${phoneNumber}`,
      },
    });

    await sendNotificationEmail("buySell", {
      model: `${brand} ${model} ${year}`,
      customer: `${name} - ${phoneNumber}`,
    });

    // Kirim response sukses
    res.status(201).json({
      success: true,
      message: "Permintaan jual mobil berhasil dibuat.", // Pesan disesuaikan
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating sell request:", error);
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
      message: "Server Error: Gagal membuat permintaan jual mobil.", // Pesan disesuaikan
    });
  }
};

// --- Fungsi lain (Get All, Get By ID, Update Status) ---
// Logikanya sama persis dengan tradeInController, hanya menggunakan model SellRequest

// @desc    Get all sell requests (Mungkin untuk Admin)
// @route   GET /api/sell-requests
// @access  Private (Harus ditambahkan autentikasi/autorisasi)
exports.getAllSellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 }); // Gunakan SellRequest
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching sell requests:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get single sell request by ID (Mungkin untuk Admin)
// @route   GET /api/sell-requests/:id
// @access  Private
exports.getSellRequestById = async (req, res) => {
  try {
    const request = await SellRequest.findById(req.params.id); // Gunakan SellRequest
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching single sell request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update sell request status (Mungkin untuk Admin)
// @route   PATCH /api/sell-requests/:id
// @access  Private
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
      // Gunakan SellRequest
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
