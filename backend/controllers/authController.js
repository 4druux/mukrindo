// backend/controllers/authController.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

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
      // public_id is everything after the folder name, including subfolders within mukrindo_avatars
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
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role),
        message: "Registrasi berhasil.",
      });
    } else {
      res.status(400).json({ message: "Data pengguna tidak valid." });
    }
  } catch (error) {
    console.error("Register Error:", error);
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
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role),
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
  const user = await User.findById(req.user.id).select("-password");
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } else {
    res.status(404).json({ message: "Pengguna tidak ditemukan." });
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
  const role = req.user.role;
  const userId = req.user._id;
  const firstName = req.user.firstName || "";
  const email = req.user.email || "";
  const avatar = req.user.avatar || "";

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
  redirectUrl.searchParams.append("userId", userId.toString());
  redirectUrl.searchParams.append("firstName", encodeURIComponent(firstName));
  redirectUrl.searchParams.append("email", encodeURIComponent(email));
  if (avatar) {
    redirectUrl.searchParams.append("avatar", encodeURIComponent(avatar));
  }

  console.log(
    `Google OAuth Berhasil. Redirecting ke frontend /auth/callback dengan data: ${redirectUrl.toString()}`
  );
  res.redirect(redirectUrl.toString());
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const {
      firstName,
      lastName,
      currentPassword,
      newPassword,
      removeAvatarFlag,
    } = req.body;

    if (firstName !== undefined)
      user.firstName = firstName.trim() || user.firstName;
    if (lastName !== undefined)
      user.lastName = lastName.trim() || user.lastName;

    let avatarUrl = user.avatar;

    if (req.file) {
      if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
      }
      avatarUrl = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      user.avatar = avatarUrl;
    } else if (removeAvatarFlag === "true" && user.avatar) {
      await deleteFromCloudinary(user.avatar);
      user.avatar = null;
      avatarUrl = null;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Kata sandi saat ini diperlukan untuk mengubah kata sandi.",
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Kata sandi saat ini salah." });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Kata sandi baru minimal 6 karakter." });
      }
      user.password = newPassword; // Pre-save hook akan hash password
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id, updatedUser.role),
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
