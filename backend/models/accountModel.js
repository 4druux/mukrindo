// backend/models/accountModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const accountSchema = new mongoose.Schema(
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
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

accountSchema.pre("save", async function (next) {
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

accountSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
