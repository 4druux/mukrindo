// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Contoh login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validasi dummy (ganti dengan validasi dari DB)
  if (username !== "admin" || password !== "123456") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = { id: 1, username: "admin" };

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
