// backend/controllers/authController.js
const Authentication = require("../models/authModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const {
  sendPasswordResetEmail,
  sendOtpEmail,
} = require("../services/emailService");
const crypto = require("crypto");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 5 * 60 * 1000;

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Authentication.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res
      .status(500)
      .json({ message: "Server Error saat mengambil data pengguna." });
  }
};

exports.authRegister = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    const userExists = await Authentication.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "EMAIL_TAKEN" });
    }

    let finalRole = "user";
    if (role === "admin") {
      const adminCount = await Authentication.countDocuments({ role: "admin" });
      if (adminCount >= 2) {
        return res.status(403).json({ error: "ADMIN_REG_LIMIT" });
      }
      finalRole = "admin";
    }

    const user = new Authentication({
      firstName,
      lastName,
      email,
      password,
      role: finalRole,
    });
    await user.save();

    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      success: true,
      token,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName || "",
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      hasPassword: user.hasPassword,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

exports.authLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Authentication.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const retryAfter = Math.ceil((user.lockUntil - Date.now()) / 1000);
      return res.status(403).json({ error: "ACCOUNT_LOCKED", retryAfter });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        await user.save();
        return res
          .status(403)
          .json({ error: "ACCOUNT_LOCKED", retryAfter: LOCK_TIME / 1000 });
      }
      await user.save();
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    if (user.role === "admin") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpLastSentAt = new Date();
      user.otpResendAttempts = 0;
      await user.save();
      await sendOtpEmail(user.email, user.firstName, otp);
      return res.status(200).json({ otpRequired: true, email: user.email });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      token,
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      hasPassword: user.hasPassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await Authentication.findById(req.user.id).select("-password");
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
    const user = await Authentication.findById(req.user.id);
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
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: "Kata sandi baru minimal 8 karakter." });
      }
      user.password = newPassword;
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

exports.getAdminCount = async (req, res) => {
  try {
    const adminCount = await Authentication.countDocuments({ role: "admin" });
    res.json({ adminCount });
  } catch (error) {
    console.error("Get Admin Count Error:", error);
    res.status(500).json({ message: "Server Error saat menghitung admin." });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Authentication.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    try {
      const user = await Authentication.findOne({ email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    } catch (cleanupErr) {
      console.error("Cleanup Error:", cleanupErr);
    }

    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await Authentication.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "INVALID_TOKEN" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await Authentication.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "INVALID_OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpLastSentAt = undefined;
    user.otpResendAttempts = 0;
    await user.save();

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      token,
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar || null,
      hasPassword: user.hasPassword,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Authentication.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "EMAIL_NOT_FOUND" });
    }

    const MAX_RESEND = 3;
    if ((user.otpResendAttempts || 0) >= MAX_RESEND) {
      return res.status(429).json({ error: "RESEND_LIMIT_EXCEEDED" });
    }

    const MIN_INTERVAL = 60 * 1000;
    if (
      user.otpLastSentAt &&
      Date.now() - user.otpLastSentAt.getTime() < MIN_INTERVAL
    ) {
      const secondsLeft = Math.ceil(
        (MIN_INTERVAL - (Date.now() - user.otpLastSentAt.getTime())) / 1000
      );
      return res
        .status(429)
        .json({ error: "RESEND_TOO_SOON", retryAfter: secondsLeft });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpLastSentAt = new Date();
    user.otpResendAttempts = (user.otpResendAttempts || 0) + 1;
    await user.save();
    await sendOtpEmail(user.email, user.firstName, newOtp);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};
