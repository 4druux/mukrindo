// backend/middleware/authenticateToken.js
const jwt = require("jsonwebtoken");
const Account = require("../models/accountModel");

const authenticateToken = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Account.findById(decoded.id).select("-password");
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Token tidak valid, pengguna tidak ditemukan." });
      }
      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token kedaluwarsa, harap login kembali." });
      }
      return res
        .status(401)
        .json({ message: "Token tidak valid atau tidak sah." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Tidak ada token, akses ditolak." });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Akses ditolak. Hanya untuk admin." });
  }
};

module.exports = { authenticateToken, authorizeAdmin };
