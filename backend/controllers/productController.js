const Product = require("../models/productModels");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleServerError = (res, error) => {
  console.error("Server Error:", error);
  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: error.message || error,
  });
};

const uploadToCloudinary = (fileBuffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    const baseFilename = originalFilename
      .split(".")[0]
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "");
    const uniquePublicId = `${Date.now()}-${baseFilename}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mukrindo_products",
        public_id: uniquePublicId,
        transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result || !result.secure_url)
          return reject(new Error("Cloudinary upload failed, no secure_url."));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu gambar harus diunggah",
      });
    }

    const imageUrls = [];
    for (const file of req.files) {
      try {
        const imageUrl = await uploadToCloudinary(
          file.buffer,
          file.originalname
        );
        imageUrls.push(imageUrl);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Gagal mengunggah salah satu gambar ke cloud.",
        });
      }
    }

    if (imageUrls.length === 0 && req.files.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Gagal memproses gambar yang diunggah.",
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

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      existingImages,
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

    const intendsToUpdateImages =
      (req.body &&
        typeof req.body === "object" &&
        Object.prototype.hasOwnProperty.call(req.body, "existingImages")) ||
      (req.files && req.files.length > 0);

    if (intendsToUpdateImages) {
      let finalImageUrls = [];
      const retainedImageUrls = Array.isArray(existingImages)
        ? existingImages
        : existingImages
        ? [existingImages]
        : [];

      finalImageUrls.push(...retainedImageUrls);

      const imagesToDeleteFromCloud = productToUpdate.images.filter(
        (imgUrl) => !retainedImageUrls.includes(imgUrl)
      );
      for (const imgUrl of imagesToDeleteFromCloud) {
        await deleteFromCloudinary(imgUrl);
      }

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const newImageUrl = await uploadToCloudinary(
              file.buffer,
              file.originalname
            );
            finalImageUrls.push(newImageUrl);
          } catch (uploadError) {
            console.error(
              "Cloudinary upload error during update:",
              uploadError
            );
          }
        }
      }

      if (finalImageUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Minimal satu gambar harus dipertahankan atau diunggah saat memperbarui gambar.",
        });
      }
      updatePayload.images = finalImageUrls;
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

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    return handleServerError(res, error);
  }
};

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
