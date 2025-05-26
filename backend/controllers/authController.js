// backend/controllers/authController.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Helper untuk generate token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token berlaku 30 hari
  });
};
// Registrasi Pengguna Manual
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

    // Validasi sederhana untuk password (bisa diperketat)
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Kata sandi minimal 6 karakter." });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Role akan default 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
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

// Login Pengguna Manual
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

// Mendapatkan Profil User (setelah login)
exports.getUserProfile = async (req, res) => {
  // req.user akan diisi oleh middleware authenticateToken (JWT)
  const user = await User.findById(req.user.id).select("-password"); // Jangan kirim password
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
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
    // Arahkan ke halaman login frontend dengan pesan error jika req.user tidak ada
    // (Ini akan terjadi jika Passport gagal mengisi req.user karena error dari Google sebelum access_denied)
    const failureRedirectUrl = new URL(
      "/login", // atau halaman error khusus OAuth
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

  const baseFrontendUrl =
    process.env.FRONTEND_URL_FOR_OAUTH_REDIRECT || process.env.FRONTEND_URL;

  if (!baseFrontendUrl) {
    console.error(
      "FRONTEND_URL atau FRONTEND_URL_FOR_OAUTH_REDIRECT tidak terkonfigurasi untuk Google callback."
    );
    return res.status(500).send("Konfigurasi URL Frontend bermasalah.");
  }

  // **PERUBAHAN DI SINI:** Mengarah ke /auth/callback di frontend
  const redirectUrl = new URL("/auth/callback", baseFrontendUrl);
  redirectUrl.searchParams.append("token", token);
  redirectUrl.searchParams.append("role", role);
  redirectUrl.searchParams.append("userId", userId.toString());
  redirectUrl.searchParams.append("firstName", encodeURIComponent(firstName));
  redirectUrl.searchParams.append("email", encodeURIComponent(email));
  // Tambahkan loginType untuk kejelasan di callback page, jika mau
  // redirectUrl.searchParams.append("loginType", "google");

  console.log(
    `Google OAuth Berhasil. Redirecting ke frontend /auth/callback dengan data: ${redirectUrl.toString()}`
  );
  res.redirect(redirectUrl.toString());
};
