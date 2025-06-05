const Product = require("../models/productModels");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  format,
  eachWeekOfInterval,
  isWithinInterval,
  getMonth,
  getYear,
  parseISO,
  isValid,
} = require("date-fns");
const { id: localeID } = require("date-fns/locale");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handle Server Error
const handleServerError = (res, error) => {
  console.error("Server Error:", error);
  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: error.message || error,
  });
};

// Safe Parse ISO
const safeParseISO = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;
  if (typeof dateInput === "string") {
    const parsed = parseISO(dateInput);
    return isValid(parsed) ? parsed : null;
  }
  if (typeof dateInput === "number") {
    const parsed = new Date(dateInput);
    return isValid(parsed) ? parsed : null;
  }
  return null;
};

// Upload To Cloudinary
// const uploadToCloudinary = (fileBuffer, originalFilename) => {
//   return new Promise((resolve, reject) => {
//     const baseFilename = originalFilename
//       .split(".")[0]
//       .replace(/\s+/g, "_")
//       .replace(/[^\w-]/g, "");
//     const uniquePublicId = `${Date.now()}-${baseFilename}`;
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: "mukrindo_products",
//         public_id: uniquePublicId,
//         transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
//         resource_type: "image",
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         if (!result || !result.secure_url)
//           return reject(new Error("Cloudinary upload failed, no secure_url."));
//         resolve(result.secure_url);
//       }
//     );
//     uploadStream.end(fileBuffer);
//   });
// };

// Delete From Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return;
  try {
    const parts = imageUrl.split("/");
    const versionIndex = parts.findIndex(
      (part) => part.startsWith("v") && !isNaN(parseInt(part.substring(1)))
    );
    if (versionIndex > -1 && versionIndex + 1 < parts.length) {
      const publicIdWithExtension = parts.slice(versionIndex + 1).join("/");
      const publicId = publicIdWithExtension.substring(
        0,
        publicIdWithExtension.lastIndexOf(".")
      );
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.warn(
      `Gagal menghapus gambar lama dari Cloudinary: ${imageUrl}`,
      error
    );
  }
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      carName,
      brand,
      model,
      variant,
      type,
      numberOfSeats,
      carColor,
      cc,
      travelDistance,
      driveSystem,
      transmission,
      fuelType,
      stnkExpiry,
      plateNumber,
      yearOfAssembly,
      price,
      status,
      imageUrls,
    } = req.body;

    const requiredFields = [
      carName,
      brand,
      model,
      variant,
      type,
      numberOfSeats,
      carColor,
      cc,
      travelDistance,
      driveSystem,
      transmission,
      fuelType,
      stnkExpiry,
      plateNumber,
      yearOfAssembly,
      price,
    ];
    if (requiredFields.some((field) => !field)) {
      return res.status(400).json({
        success: false,
        message: "Semua field produk (non-gambar) harus diisi",
      });
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu URL gambar produk harus disertakan",
      });
    }

    const newProduct = new Product({
      carName,
      brand,
      model,
      variant,
      type,
      numberOfSeats,
      carColor,
      cc,
      travelDistance,
      driveSystem,
      transmission,
      fuelType,
      stnkExpiry,
      plateNumber,
      yearOfAssembly,
      price,
      images: imageUrls,
      status: status || "Tersedia",
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      product: savedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid.",
        errors: error.errors,
      });
    }
    return handleServerError(res, error);
  }
};

// Update Id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      imageUrls,
      carName,
      brand,
      model,
      variant,
      type,
      numberOfSeats,
      carColor,
      cc,
      travelDistance,
      driveSystem,
      transmission,
      fuelType,
      stnkExpiry,
      plateNumber,
      yearOfAssembly,
      price,
      status,
    } = req.body;

    const productToUpdate = await Product.findById(id);
    if (!productToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    }

    const productDataFields = {};
    const fieldsToUpdate = {
      carName,
      brand,
      model,
      variant,
      type,
      numberOfSeats,
      carColor,
      cc,
      travelDistance,
      driveSystem,
      transmission,
      fuelType,
      stnkExpiry,
      plateNumber,
      yearOfAssembly,
      price,
      status,
    };
    const numericFields = [
      "numberOfSeats",
      "cc",
      "travelDistance",
      "yearOfAssembly",
      "price",
    ];

    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate[key] !== undefined) {
        productDataFields[key] =
          numericFields.includes(key) && fieldsToUpdate[key] !== ""
            ? Number(fieldsToUpdate[key])
            : fieldsToUpdate[key];
      }
    }

    const updatePayload = { ...productDataFields };

    if (imageUrls && Array.isArray(imageUrls)) {
      const imagesToDeleteFromCloud = productToUpdate.images.filter(
        (imgUrl) => !imageUrls.includes(imgUrl)
      );
      for (const imgUrl of imagesToDeleteFromCloud) {
        await deleteFromCloudinary(imgUrl);
      }

      updatePayload.images = imageUrls;

      if (imageUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Minimal satu gambar harus dipertahankan atau diunggah saat memperbarui gambar.",
        });
      }
    } else if (req.body.hasOwnProperty("imageUrls") && imageUrls === null) {
      for (const imgUrl of productToUpdate.images) {
        await deleteFromCloudinary(imgUrl);
      }
      updatePayload.images = [];
    }

    if (
      updatePayload.status &&
      !["Tersedia", "Terjual"].includes(updatePayload.status)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Status tidak valid" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan setelah mencoba update.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid.",
        errors: error.errors,
      });
    }
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, message: "ID Produk tidak valid" });
    }
    return handleServerError(res, error);
  }
};

// Delete Id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    }

    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        await deleteFromCloudinary(imageUrl);
      }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, message: "ID Produk tidak valid" });
    }
    return handleServerError(res, error);
  }
};

// Get All
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    return handleServerError(res, error);
  }
};

// Get Id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    }
    res.status(200).json(product);
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, message: "ID Produk tidak valid" });
    }
    return handleServerError(res, error);
  }
};

// View Count
exports.incrementViewCount = async (req, res) => {
  try {
    const { id: productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "ID Produk diperlukan" });
    }
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(200).json({
      success: true,
      viewCount: product.viewCount,
      message: "View count incremented.",
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, message: "ID Produk tidak valid" });
    }
    return handleServerError(res, error);
  }
};

// Rekomendasi Produk
exports.getProductRecommendations = async (req, res) => {
  try {
    const { id: currentProductIdString } = req.params;
    const MAX_RECOMMENDATIONS = 5;
    if (!mongoose.Types.ObjectId.isValid(currentProductIdString)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Produk tidak valid." });
    }
    const currentProductId = new mongoose.Types.ObjectId(
      currentProductIdString
    );

    // 1. Dapatkan produk saat ini untuk mengetahui clusterId-nya
    const currentProduct = await Product.findById(currentProductId).select(
      "clusterId carName brand model"
    ); // Ambil field tambahan untuk logging/fallback
    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Produk saat ini tidak ditemukan." });
    }

    // Periksa apakah produk memiliki clusterId
    if (
      currentProduct.clusterId === undefined ||
      currentProduct.clusterId === null
    ) {
      console.warn(
        `Produk ${
          currentProduct.carName || currentProductIdString
        } tidak memiliki clusterId. Tidak dapat memberikan rekomendasi berbasis cluster.`
      );
      // Fallback: Anda bisa mengembalikan produk populer atau terbaru jika tidak ada clusterId
      // Untuk sekarang, kita kembalikan array kosong
      const fallbackRecommendations = await Product.find({
        _id: { $ne: currentProductId }, // Kecualikan produk saat ini
        status: "Tersedia",
      })
        .sort({ viewCount: -1, createdAt: -1 }) // Contoh: Populer berdasarkan viewCount, lalu terbaru
        .limit(MAX_RECOMMENDATIONS);

      return res.status(200).json({
        success: true,
        recommendations: fallbackRecommendations,
        message:
          "Menggunakan rekomendasi fallback karena produk tidak memiliki cluster.",
      });
    }

    // 2. Cari produk lain dalam cluster yang sama
    const recommendations = await Product.find({
      _id: { $ne: currentProductId },
      clusterId: currentProduct.clusterId,
      status: "Tersedia",
    })
      .sort({ updatedAt: -1 })
      .limit(MAX_RECOMMENDATIONS)
      .lean(); // Gunakan .lean() untuk performa query yang lebih baik jika hanya membaca data

    if (recommendations.length === 0) {
      console.log(
        `Tidak ada rekomendasi di cluster ${currentProduct.clusterId}... Mencoba fallback berdasarkan model.`
      );
      fallbackRecommendations = await Product.find({
        _id: { $ne: currentProductId },
        status: "Tersedia",
        brand: currentProduct.brand, // Cari brand yang sama
        model: currentProduct.model, // Cari model yang sama
      })
        .sort({ yearOfAssembly: -1, price: 1 }) // Prioritaskan tahun terbaru, lalu harga termurah
        .limit(MAX_RECOMMENDATIONS)
        .lean();

      if (fallbackRecommendations.length > 0) {
        return res.status(200).json({
          success: true,
          recommendations: fallbackRecommendations,
          message:
            "Menggunakan rekomendasi fallback berdasarkan model yang sama.",
        });
      } else {
        // Fallback lebih lanjut jika model sama juga tidak ada
        const generalFallback = await Product.find({
          /* ... seperti sebelumnya ... */
        });
        return res.status(200).json({
          success: true,
          recommendations: generalFallback,
          message: "Menggunakan rekomendasi fallback umum.",
        });
      }
    }

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    // Error CastError sudah ditangani di awal dengan validasi ObjectId
    console.error("Error fetching product recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Gagal mengambil rekomendasi.",
    });
  }
};

// Product Report Chart
exports.getProductReportStats = async (req, res) => {
  try {
    const { period = "weekly", year: queryYear } = req.query;
    const currentChartYear = queryYear
      ? parseInt(queryYear)
      : new Date().getFullYear();
    const now = new Date();

    let categories = [];
    let masukData = [];
    let terjualData = [];
    let productsForExport = [];

    let queryStartDate, queryEndDate;

    if (period === "weekly") {
      const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });
      queryStartDate = startOfWeek(subWeeks(endOfThisWeek, 11), {
        weekStartsOn: 1,
      });
      queryEndDate = endOfThisWeek;
      const weeks = eachWeekOfInterval(
        { start: queryStartDate, end: queryEndDate },
        { weekStartsOn: 1 }
      );
      categories = weeks.map((w) => format(w, "dd MMM", { locale: localeID }));
      masukData = Array(weeks.length).fill(0);
      terjualData = Array(weeks.length).fill(0);
    } else if (period === "monthly") {
      queryStartDate = startOfYear(new Date(currentChartYear, 0, 1));
      queryEndDate = endOfYear(new Date(currentChartYear, 11, 31));
      const months = Array.from({ length: 12 }, (_, i) =>
        startOfMonth(new Date(currentChartYear, i))
      );
      categories = months.map((m) => format(m, "MMM yy", { locale: localeID }));
      masukData = Array(12).fill(0);
      terjualData = Array(12).fill(0);
    } else if (period === "yearly") {
      const endChartYear = getYear(now);
      const startChartYear = endChartYear - 4;
      queryStartDate = startOfYear(new Date(startChartYear, 0, 1));
      queryEndDate = endOfYear(now);
      const years = Array.from({ length: 5 }, (_, i) => startChartYear + i);
      categories = years.map((y) => y.toString());
      masukData = Array(5).fill(0);
      terjualData = Array(5).fill(0);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Periode tidak valid." });
    }

    const productsInPeriod = await Product.find({
      $or: [
        { createdAt: { $gte: queryStartDate, $lte: queryEndDate } },
        {
          status: "Terjual",
          $expr: {
            $let: {
              vars: {
                saleDateObj: {
                  $ifNull: [
                    { $toDate: "$soldDate" },
                    { $toDate: "$updatedAt" },
                  ],
                },
              },
              in: {
                $and: [
                  { $ne: ["$$saleDateObj", null] },
                  { $gte: ["$$saleDateObj", queryStartDate] },
                  { $lte: ["$$saleDateObj", queryEndDate] },
                ],
              },
            },
          },
        },
      ],
    }).lean();

    productsForExport = productsInPeriod.map((p) => ({
      ...p,
      effectiveSaleDate:
        p.status === "Terjual" ? p.soldDate || p.updatedAt : null,
    }));

    productsInPeriod.forEach((p) => {
      const creationDate = safeParseISO(p.createdAt);
      const saleDate =
        p.status === "Terjual" ? safeParseISO(p.soldDate || p.updatedAt) : null;

      if (period === "weekly") {
        if (
          creationDate &&
          isValid(creationDate) &&
          isWithinInterval(creationDate, {
            start: queryStartDate,
            end: queryEndDate,
          })
        ) {
          const weekIndex = eachWeekOfInterval(
            { start: queryStartDate, end: queryEndDate },
            { weekStartsOn: 1 }
          ).findIndex(
            (weekStart) =>
              creationDate >= weekStart &&
              creationDate <= endOfWeek(weekStart, { weekStartsOn: 1 })
          );
          if (weekIndex !== -1) masukData[weekIndex]++;
        }
        if (
          saleDate &&
          isValid(saleDate) &&
          isWithinInterval(saleDate, {
            start: queryStartDate,
            end: queryEndDate,
          })
        ) {
          const weekIndex = eachWeekOfInterval(
            { start: queryStartDate, end: queryEndDate },
            { weekStartsOn: 1 }
          ).findIndex(
            (weekStart) =>
              saleDate >= weekStart &&
              saleDate <= endOfWeek(weekStart, { weekStartsOn: 1 })
          );
          if (weekIndex !== -1) terjualData[weekIndex]++;
        }
      } else if (period === "monthly") {
        if (
          creationDate &&
          isValid(creationDate) &&
          getYear(creationDate) === currentChartYear
        ) {
          masukData[getMonth(creationDate)]++;
        }
        if (
          saleDate &&
          isValid(saleDate) &&
          getYear(saleDate) === currentChartYear
        ) {
          terjualData[getMonth(saleDate)]++;
        }
      } else if (period === "yearly") {
        const startChartYearValue = getYear(queryStartDate);
        if (creationDate && isValid(creationDate)) {
          const yearIndex = getYear(creationDate) - startChartYearValue;
          if (yearIndex >= 0 && yearIndex < categories.length)
            masukData[yearIndex]++;
        }
        if (saleDate && isValid(saleDate)) {
          const yearIndex = getYear(saleDate) - startChartYearValue;
          if (yearIndex >= 0 && yearIndex < categories.length)
            terjualData[yearIndex]++;
        }
      }
    });

    res.json({
      success: true,
      data: {
        chartValues: { categories, masuk: masukData, terjual: terjualData },
        exportableData: {
          items: productsForExport.map((p) => ({
            carName: p.carName,
            brand: p.brand,
            model: p.model,
            price: p.price,
            createdAt: p.createdAt
              ? p.createdAt instanceof Date
                ? p.createdAt.toISOString()
                : p.createdAt.toString()
              : null,
            effectiveSaleDate: p.effectiveSaleDate
              ? p.effectiveSaleDate instanceof Date
                ? p.effectiveSaleDate.toISOString()
                : p.effectiveSaleDate.toString()
              : null,
            status: p.status,
          })),
        },
      },
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

// Product Sales Stats
exports.getProductSalesStats = async (req, res) => {
  try {
    const { period = "weekly", year: queryYear } = req.query;
    const currentChartYear = queryYear
      ? parseInt(queryYear)
      : new Date().getFullYear();
    const now = new Date();

    let categories = [];
    let salesData = [];
    let revenueData = [];
    let soldProductsForExport = [];

    const baseMatchConditions = {
      status: "Terjual",
      price: { $exists: true, $gt: 0 },
      $or: [
        { soldDate: { $exists: true, $ne: null } },
        { updatedAt: { $exists: true, $ne: null } },
      ],
    };

    if (period === "weekly") {
      const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });
      const startOfPeriod = startOfWeek(subWeeks(endOfThisWeek, 11), {
        weekStartsOn: 1,
      });
      const weeks = eachWeekOfInterval(
        { start: startOfPeriod, end: endOfThisWeek },
        { weekStartsOn: 1 }
      );

      categories = weeks.map((w) => format(w, "dd MMM", { locale: localeID }));
      salesData = Array(weeks.length).fill(0);
      revenueData = Array(weeks.length).fill(0);

      const productsInPeriod = await Product.find({
        ...baseMatchConditions,
        $expr: {
          $let: {
            vars: {
              saleDateObj: {
                $ifNull: [{ $toDate: "$soldDate" }, { $toDate: "$updatedAt" }],
              },
            },
            in: {
              $and: [
                { $ne: ["$$saleDateObj", null] },
                { $gte: ["$$saleDateObj", startOfPeriod] },
                { $lte: ["$$saleDateObj", endOfThisWeek] },
              ],
            },
          },
        },
      }).lean();

      soldProductsForExport = productsInPeriod.map((p) => ({
        ...p,
        saleDate: p.soldDate || p.updatedAt,
      }));

      productsInPeriod.forEach((p) => {
        const saleDate = safeParseISO(p.soldDate || p.updatedAt);
        if (saleDate && isValid(saleDate)) {
          const weekIndex = weeks.findIndex(
            (weekStart) =>
              saleDate >= weekStart &&
              saleDate <= endOfWeek(weekStart, { weekStartsOn: 1 })
          );
          if (weekIndex !== -1) {
            salesData[weekIndex]++;
            revenueData[weekIndex] += p.price;
          }
        }
      });
    } else if (period === "monthly") {
      const months = Array.from({ length: 12 }, (_, i) =>
        startOfMonth(new Date(currentChartYear, i))
      );
      categories = months.map((m) => format(m, "MMM yy", { locale: localeID }));
      salesData = Array(12).fill(0);
      revenueData = Array(12).fill(0);

      const productsInPeriod = await Product.find({
        ...baseMatchConditions,
        $expr: {
          $let: {
            vars: {
              saleDateObj: {
                $ifNull: [{ $toDate: "$soldDate" }, { $toDate: "$updatedAt" }],
              },
            },
            in: {
              $and: [
                { $ne: ["$$saleDateObj", null] },
                { $eq: [{ $year: "$$saleDateObj" }, currentChartYear] },
              ],
            },
          },
        },
      }).lean();
      soldProductsForExport = productsInPeriod.map((p) => ({
        ...p,
        saleDate: p.soldDate || p.updatedAt,
      }));

      productsInPeriod.forEach((p) => {
        const saleDate = safeParseISO(p.soldDate || p.updatedAt);
        if (
          saleDate &&
          isValid(saleDate) &&
          getYear(saleDate) === currentChartYear
        ) {
          const monthIndex = getMonth(saleDate);
          salesData[monthIndex]++;
          revenueData[monthIndex] += p.price;
        }
      });
    } else if (period === "yearly") {
      const endChartYear = getYear(now);
      const startChartYear = endChartYear - 4;
      const years = Array.from({ length: 5 }, (_, i) => startChartYear + i);
      categories = years.map((y) => y.toString());
      salesData = Array(5).fill(0);
      revenueData = Array(5).fill(0);

      const productsInPeriod = await Product.find({
        ...baseMatchConditions,
        $expr: {
          $let: {
            vars: {
              saleDateObj: {
                $ifNull: [{ $toDate: "$soldDate" }, { $toDate: "$updatedAt" }],
              },
            },
            in: {
              $and: [
                { $ne: ["$$saleDateObj", null] },
                { $gte: [{ $year: "$$saleDateObj" }, startChartYear] },
                { $lte: [{ $year: "$$saleDateObj" }, endChartYear] },
              ],
            },
          },
        },
      }).lean();
      soldProductsForExport = productsInPeriod.map((p) => ({
        ...p,
        saleDate: p.soldDate || p.updatedAt,
      }));

      productsInPeriod.forEach((p) => {
        const saleDate = safeParseISO(p.soldDate || p.updatedAt);
        if (saleDate && isValid(saleDate)) {
          const yearIndex = getYear(saleDate) - startChartYear;
          if (yearIndex >= 0 && yearIndex < 5) {
            salesData[yearIndex]++;
            revenueData[yearIndex] += p.price;
          }
        }
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Periode tidak valid." });
    }

    const totalRevenueForExport = soldProductsForExport.reduce(
      (sum, p) => sum + (p.price || 0),
      0
    );

    res.json({
      success: true,
      data: {
        chartValues: { categories, sales: salesData, revenue: revenueData },
        exportableData: {
          items: soldProductsForExport.map((p) => ({
            carName: p.carName,
            brand: p.brand,
            model: p.model,
            saleDate: p.saleDate
              ? p.saleDate instanceof Date
                ? p.saleDate.toISOString()
                : p.saleDate.toString()
              : null,
            price: p.price,
          })),
          totalRevenue: totalRevenueForExport,
        },
      },
    });
  } catch (error) {
    handleServerError(res, error);
  }
};
