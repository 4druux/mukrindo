// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  googleCallback,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authenticateToken");

const passport = require("passport");
try {
  require("../config/passport-setup");
} catch (e) {
  console.warn(
    "Peringatan: Gagal memuat konfigurasi Passport. Error:",
    e.message
  );
}

// ... rute lainnya tetap sama ...
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, getUserProfile);

router.get("/google", (req, res, next) => {
  if (passport._strategy("google")) {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  } else {
    res
      .status(500)
      .send("Strategi Google OAuth belum dikonfigurasi di backend.");
  }
});

// Rute callback dari Google
router.get(
  "/google/callback",
  // Middleware 1: Periksa pembatalan oleh pengguna (access_denied)
  (req, res, next) => {
    if (req.query.error === "access_denied") {
      console.log(
        "Google OAuth: Pengguna membatalkan atau menolak akses. Mengarahkan ke halaman registrasi frontend."
      );
      const frontendUrl = process.env.FRONTEND_URL;
      if (!frontendUrl) {
        console.error(
          "FRONTEND_URL tidak terkonfigurasi untuk redirect pembatalan."
        );
        return res.status(500).send("Konfigurasi URL Frontend bermasalah.");
      }
      // Menggunakan new URL untuk konstruksi yang lebih aman
      const registerRedirectUrl = new URL("/register", frontendUrl);
      return res.redirect(registerRedirectUrl.toString());
    }
    next(); // Lanjutkan jika bukan access_denied
  },
  // Middleware 2: Otentikasi Passport
  (req, res, next) => {
    if (passport._strategy("google")) {
      passport.authenticate("google", {
        session: false,
      })(req, res, next);
    } else {
      res
        .status(500)
        .send("Strategi Google OAuth callback belum dikonfigurasi.");
    }
  },
  googleCallback
);

module.exports = router;
