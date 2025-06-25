// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  authRegister,
  authLogin,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getUserProfile,
  googleCallback,
  updateUserProfile,
  getAdminCount,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authenticateToken");
const multer = require("multer");

const passport = require("passport");
try {
  require("../config/passport-setup");
} catch (e) {
  console.warn(
    "Peringatan: Gagal memuat konfigurasi Passport. Error:",
    e.message
  );
}

const storage = multer.memoryStorage();
const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan!"), false);
    }
  },
});

router.post("/register", authRegister);
router.post("/login", authLogin);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/profile", authenticateToken, getUserProfile);
router.get("/admin-count", getAdminCount);

router.get(
  "/users",
  authenticateToken,
  (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Akses ditolak. Memerlukan hak admin." });
    }
  },
  getAllUsers
);

router.put(
  "/profile",
  authenticateToken,
  uploadAvatar.single("avatar"),
  updateUserProfile
);

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

router.get(
  "/google/callback",
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
      const registerRedirectUrl = new URL("/register", frontendUrl);
      return res.redirect(registerRedirectUrl.toString());
    }
    next();
  },
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
