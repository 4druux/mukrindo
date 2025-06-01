// backend/controllers/carDataController.js
const CarData = require("../models/carDataModels");

exports.getAllCarData = async (req, res) => {
  try {
    const allData = await CarData.find().sort({ brandName: 1 });

    res.status(200).json({ success: true, data: allData });
  } catch (error) {
    console.error("Error fetching all master data:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data master." });
  }
};

exports.addBrand = async (req, res) => {
  try {
    const { name, imgUrl } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Nama merek wajib diisi." });
    }
    const existingBrand = await CarData.findOne({
      brandName: {
        $regex: new RegExp(`^<span class="math-inline">\{name\}</span>`, "i"),
      },
    });
    if (existingBrand) {
      return res
        .status(400)
        .json({ success: false, message: "Merek sudah ada." });
    }
    const newBrandEntry = new CarData({
      brandName: name,
      imgUrl: imgUrl || "/images/Carbrand/default.png",
      models: [],
    });
    await newBrandEntry.save();
    res.status(201).json({
      success: true,
      message: "Merek berhasil ditambahkan.",
      data: newBrandEntry,
    });
  } catch (error) {
    console.error("Error adding brand:", error);
  }
};

exports.addModelToBrand = async (req, res) => {
  try {
    const { brandName, modelName } = req.body;
    if (!brandName || !modelName) {
      return res.status(400).json({
        success: false,
        message: "Nama merek dan nama model wajib diisi.",
      });
    }

    const searchBrandName = brandName.trim();
    const searchModelName = modelName.trim();

    const brandEntry = await CarData.findOne({
      brandName: { $regex: new RegExp(`^${searchBrandName}$`, "i") },
    });

    if (!brandEntry) {
      return res.status(404).json({
        success: false,
        message: `Merek '${searchBrandName}' tidak ditemukan.`,
      });
    }

    const modelExists = brandEntry.models.some(
      (m) => m.name.toLowerCase() === searchModelName.toLowerCase()
    );
    if (modelExists) {
      return res.status(400).json({
        success: false,
        message: `Model '${searchModelName}' sudah ada untuk merek '${brandEntry.brandName}'.`,
      });
    }

    brandEntry.models.push({ name: searchModelName, variants: [] });
    await brandEntry.save();
    res.status(201).json({
      success: true,
      message: `Model '${searchModelName}' berhasil ditambahkan ke merek '${brandEntry.brandName}'.`,
      data: brandEntry,
    });
  } catch (error) {
    console.error("Error adding model to brand:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menambahkan model." });
  }
};

exports.addVariantToModel = async (req, res) => {
  try {
    const { brandName, modelName, variantName } = req.body;
    if (!brandName || !modelName || !variantName) {
      return res.status(400).json({
        success: false,
        message: "Nama merek, nama model, dan nama varian wajib diisi.",
      });
    }

    const searchBrandName = brandName.trim();
    const searchModelName = modelName.trim();
    const searchVariantName = variantName.trim();

    const brandEntry = await CarData.findOne({
      brandName: { $regex: new RegExp(`^${searchBrandName}$`, "i") },
    });

    if (!brandEntry) {
      return res.status(404).json({
        success: false,
        message: `Merek '${searchBrandName}' tidak ditemukan.`,
      });
    }

    const modelEntry = brandEntry.models.find(
      (m) => m.name.toLowerCase() === searchModelName.toLowerCase()
    );
    if (!modelEntry) {
      return res.status(404).json({
        success: false,
        message: `Model '${searchModelName}' tidak ditemukan untuk merek '${brandEntry.brandName}'.`,
      });
    }

    const variantExists = modelEntry.variants.some(
      (v) => v.name.toLowerCase() === searchVariantName.toLowerCase()
    );
    if (variantExists) {
      return res.status(400).json({
        success: false,
        message: `Varian '${searchVariantName}' sudah ada untuk model '${modelEntry.name}'.`,
      });
    }

    modelEntry.variants.push({ name: searchVariantName });
    await brandEntry.save();
    res.status(201).json({
      success: true,
      message: `Varian '${searchVariantName}' berhasil ditambahkan ke model '${modelEntry.name}'.`,
      data: brandEntry,
    });
  } catch (error) {
    console.error("Error adding variant to model:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal menambahkan varian." });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { brandName } = req.body;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        message: "Nama merek wajib diisi untuk penghapusan.",
      });
    }

    const brandToDelete = await CarData.findOneAndDelete({
      brandName: { $regex: new RegExp(`^${brandName}$`, "i") },
    });

    if (!brandToDelete) {
      return res.status(404).json({
        success: false,
        message: `Merek '${brandName}' tidak ditemukan.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Merek '${brandName}' dan semua model serta variannya berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus merek karena kesalahan server.",
    });
  }
};

exports.deleteModelFromBrand = async (req, res) => {
  try {
    const { brandName, modelName } = req.body;

    if (!brandName || !modelName) {
      return res.status(400).json({
        success: false,
        message: "Nama merek dan nama model wajib diisi untuk penghapusan.",
      });
    }

    const brandEntry = await CarData.findOne({
      brandName: { $regex: new RegExp(`^${brandName}$`, "i") },
    });

    if (!brandEntry) {
      return res.status(404).json({
        success: false,
        message: `Merek '${brandName}' tidak ditemukan.`,
      });
    }

    const modelIndex = brandEntry.models.findIndex(
      (m) => m.name.toLowerCase() === modelName.toLowerCase()
    );

    if (modelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' tidak ditemukan pada merek '${brandName}'.`,
      });
    }

    brandEntry.models.splice(modelIndex, 1);

    await brandEntry.save();
    res.status(200).json({
      success: true,
      message: `Model '${modelName}' berhasil dihapus dari merek '${brandName}'.`,
      data: brandEntry,
    });
  } catch (error) {
    console.error("Error deleting model from brand:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus model karena kesalahan server.",
    });
  }
};

exports.deleteVariantFromModel = async (req, res) => {
  try {
    const { brandName, modelName, variantName } = req.body;

    if (!brandName || !modelName || !variantName) {
      return res.status(400).json({
        success: false,
        message:
          "Nama merek, nama model, dan nama varian wajib diisi untuk penghapusan.",
      });
    }

    const brandEntry = await CarData.findOne({
      brandName: { $regex: new RegExp(`^${brandName}$`, "i") },
    });
    if (!brandEntry) {
      return res.status(404).json({
        success: false,
        message: `Merek '${brandName}' tidak ditemukan.`,
      });
    }

    const modelEntry = brandEntry.models.find(
      (m) => m.name.toLowerCase() === modelName.toLowerCase()
    );
    if (!modelEntry) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' tidak ditemukan pada merek '${brandName}'.`,
      });
    }

    const variantIndex = modelEntry.variants.findIndex(
      (v) => v.name.toLowerCase() === variantName.toLowerCase()
    );

    if (variantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Varian '${variantName}' tidak ditemukan pada model '${modelName}'.`,
      });
    }

    modelEntry.variants.splice(variantIndex, 1);

    await brandEntry.save();
    res.status(200).json({
      success: true,
      message: `Varian '${variantName}' berhasil dihapus dari model '${modelName}'.`,
      data: brandEntry,
    });
  } catch (error) {
    console.error("Error deleting variant from model:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus varian karena kesalahan server.",
    });
  }
};
