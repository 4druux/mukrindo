const Product = require("../models/productModels");

// Helper function untuk handle error
const handleServerError = (res, error) => {
  console.error("Server Error:", error);
  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: error.message || error,
  });
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const {
      carName,
      brand,
      model,
      variant,
      type,
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
      images,
      status, // Ambil status dari request body
    } = req.body;

    // Validasi data (termasuk status, jika tidak diberikan, default akan digunakan)
    if (
      !carName ||
      !brand ||
      !model ||
      !variant ||
      !type ||
      !carColor ||
      !cc ||
      !travelDistance ||
      !driveSystem ||
      !transmission ||
      !fuelType ||
      !stnkExpiry ||
      !plateNumber ||
      !yearOfAssembly ||
      !price ||
      !images ||
      images.length === 0
    ) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Buat produk baru (status akan diisi dari req.body, atau default jika tidak ada)
    const newProduct = new Product({
      carName,
      brand,
      model,
      variant,
      type,
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
      images,
      status, // Sertakan status
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      product: savedProduct,
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.status(200).json(product);
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID Produk tidak valid" });
    }
    handleServerError(res, error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID Produk diperlukan" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Validasi tambahan untuk status (jika ada di updatedData)
    if (
      updatedData.status &&
      !["Tersedia", "Terjual"].includes(updatedData.status)
    ) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    // Update product data, termasuk gambar (jika ada) dan status
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Produk berhasil diperbarui",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID Produk tidak valid" });
    }
    handleServerError(res, error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID Produk diperlukan" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Hapus produk dari database (gambar akan ikut terhapus)
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID Produk tidak valid" });
    }
    handleServerError(res, error);
  }
};

// @desc    Increment view count for a product
// @route   PUT /api/products/:id/increment-view
// @access  Public (atau Private jika Anda ingin membatasi siapa yang bisa memicu ini)
exports.incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID Produk diperlukan" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.status(200).json({ viewCount: product.viewCount });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: "ID Produk tidak valid" });
    }
    handleServerError(res, error);
  }
};
