const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
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
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },

    otp: { type: String },
    otpExpires: { type: Date },
    otpLastSentAt: { type: Date },
    otpResendAttempts: { type: Number, default: 0 },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

authSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (!this.password) {
      this.password = undefined;
      this.hasPassword = false;
    } else {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.hasPassword = true;
    }
  } else {
    if (this.googleId && !this.password && this.isNew) {
      this.hasPassword = false;
    }
  }
  next();
});

authSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
