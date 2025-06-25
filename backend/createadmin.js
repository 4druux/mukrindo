// scripts/createAdmin.js
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Authentication = require("./models/authModel");
const connectDB = require("./config/db");

connectDB();

const createAdminUsers = async () => {
  const adminUsersData = [
    {
      firstName: "Admin",
      lastName: "Satu",
      email: "admin1@mukrindo.com",
      password: "adminmukrindo1",
      role: "admin",
    },
    {
      firstName: "Admin",
      lastName: "Dua",
      email: "admin2@mukrindo.com",
      password: "adminmukrindo2",
      role: "admin",
    },
  ];

  try {
    const existingAdmins = await Authentication.countDocuments({
      role: "admin",
    });
    if (existingAdmins >= 2) {
      console.log(
        "Jumlah akun admin sudah maksimal (2). Tidak ada akun baru dibuat."
      );
      mongoose.connection.close();
      return;
    }

    let createdCount = 0;
    for (const adminData of adminUsersData) {
      if ((await Authentication.countDocuments({ role: "admin" })) >= 2) break;

      const userExists = await Authentication.findOne({
        email: adminData.email,
      });
      if (!userExists) {
        await Authentication.create(adminData);
        console.log(`Admin ${adminData.email} berhasil dibuat.`);
        createdCount++;
      } else {
        console.log(`Admin ${adminData.email} sudah ada.`);
      }
    }
    if (createdCount > 0) {
      console.log(`${createdCount} akun admin baru berhasil dibuat.`);
    } else {
      console.log(
        "Tidak ada akun admin baru yang perlu dibuat atau sudah mencapai batas maksimal."
      );
    }
  } catch (error) {
    console.error("Error membuat admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUsers();
