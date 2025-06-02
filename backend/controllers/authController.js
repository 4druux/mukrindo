// backend/controllers/authController.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const uploadToCloudinary = (fileBuffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    const baseFilename = originalFilename
      .split(".")[0]
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "");
    const uniquePublicId = `avatars/${Date.now()}-${baseFilename}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mukrindo_avatars",
        public_id: uniquePublicId,
        transformation: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
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
    const folderIndex = parts.findIndex((part) => part === "mukrindo_avatars");
    if (folderIndex > -1 && folderIndex + 1 < parts.length) {
      const publicIdWithExtension = parts.slice(folderIndex + 1).join("/");
      const publicId = publicIdWithExtension.substring(
        0,
        publicIdWithExtension.lastIndexOf(".")
      );
      if (publicId) {
        await cloudinary.uploader.destroy(`mukrindo_avatars/${publicId}`);
      }
    }
  } catch (error) {
    console.warn(
      `Gagal menghapus gambar lama dari Cloudinary: ${imageUrl}`,
      error
    );
  }
};

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Harap isi semua field." });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Kata sandi minimal 6 karakter." });
    }
    const user = new User({
      // Gunakan new User agar pre-save hook jalan
      firstName,
      lastName,
      email,
      password,
      // hasPassword akan di-set oleh pre-save hook
    });
    await user.save();

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName || "",
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      hasPassword: user.hasPassword,
      token: generateToken(user._id, user.role),
      message: "Registrasi berhasil.",
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Data tidak valid.",
        errors: messages,
      });
    }
    res.status(500).json({ message: "Server Error saat registrasi." });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan kata sandi wajib diisi." });
    }
    const user = await User.findOne({ email });
    if (user && user.password && (await user.matchPassword(password))) {
      // Pastikan user.password ada
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName || "",
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        hasPassword: user.hasPassword,
        token: generateToken(user._id, user.role),
      });
    } else if (user && !user.password && user.googleId) {
      return res
        .status(401)
        .json({
          message:
            "Akun ini terdaftar melalui Google. Silakan login dengan Google.",
        });
    } else {
      res.status(401).json({ message: "Email atau kata sandi salah." });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error saat login." });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName || "",
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        hasPassword: user.hasPassword,
      });
    } else {
      res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
  } catch (error) {
    console.error("Get User Profile Error:", error);
    res.status(500).json({ message: "Server Error saat mengambil profil." });
  }
};

exports.googleCallback = (req, res) => {
  if (!req.user) {
    console.error(
      "Google OAuth - req.user tidak ditemukan setelah autentikasi Passport."
    );
    const failureRedirectUrl = new URL(
      "/login",
      process.env.FRONTEND_URL_FOR_OAUTH_REDIRECT || process.env.FRONTEND_URL
    );
    failureRedirectUrl.searchParams.append(
      "error",
      "google_auth_provider_error"
    );
    return res.redirect(failureRedirectUrl.toString());
  }

  const token = generateToken(req.user._id, req.user.role);
  const { _id, role, firstName, lastName, email, avatar, hasPassword } =
    req.user;

  const baseFrontendUrl =
    process.env.FRONTEND_URL_FOR_OAUTH_REDIRECT || process.env.FRONTEND_URL;

  if (!baseFrontendUrl) {
    console.error(
      "FRONTEND_URL atau FRONTEND_URL_FOR_OAUTH_REDIRECT tidak terkonfigurasi untuk Google callback."
    );
    return res.status(500).send("Konfigurasi URL Frontend bermasalah.");
  }

  const redirectUrl = new URL("/auth/callback", baseFrontendUrl);
  redirectUrl.searchParams.append("token", token);
  redirectUrl.searchParams.append("role", role);
  redirectUrl.searchParams.append("userId", _id.toString());
  redirectUrl.searchParams.append(
    "firstName",
    encodeURIComponent(firstName || "")
  );
  redirectUrl.searchParams.append(
    "lastName",
    encodeURIComponent(lastName || "")
  );
  redirectUrl.searchParams.append("email", encodeURIComponent(email));
  redirectUrl.searchParams.append("hasPassword", String(hasPassword || false));
  redirectUrl.searchParams.append("loginType", "google");
  if (avatar) {
    redirectUrl.searchParams.append("avatar", encodeURIComponent(avatar));
  }

  res.redirect(redirectUrl.toString());
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const { firstName, lastName, newPassword, removeAvatarFlag } = req.body;

    if (firstName !== undefined)
      user.firstName = firstName.trim() || user.firstName;
    if (lastName !== undefined)
      user.lastName = lastName.trim() || user.lastName;

    if (req.file) {
      if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
      }
      user.avatar = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
    } else if (removeAvatarFlag === "true" && user.avatar) {
      await deleteFromCloudinary(user.avatar);
      user.avatar = null;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Kata sandi baru minimal 6 karakter." });
      }
      user.password = newPassword;
      // hasPassword akan di-set true oleh pre-save hook jika password di-set
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName || "",
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar || null,
      token: generateToken(updatedUser._id, updatedUser.role),
      hasPassword: updatedUser.hasPassword,
      message: "Profil berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Data tidak valid.", errors: error.errors });
    }
    res.status(500).json({ message: "Server Error saat memperbarui profil." });
  }
};
