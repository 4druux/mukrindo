// backend/models/userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // Wajib jika mendaftar manual, opsional jika OAuth
    },
    lastName: {
      type: String,
      // Wajib jika mendaftar manual, opsional jika OAuth
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Format email tidak valid"],
    },
    password: {
      type: String,
      // Wajib jika mendaftar manual, tidak ada jika OAuth
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    googleId: {
      // Untuk login dengan Google
      type: String,
      unique: true,
      sparse: true, // Memungkinkan null/tidak ada tapi jika ada harus unik
    },
  },
  { timestamps: true }
);

// Hash password sebelum disimpan (hanya jika password ada/diubah)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method untuk membandingkan password yang dimasukkan dengan password di DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Jika user login via OAuth, tidak ada password
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
