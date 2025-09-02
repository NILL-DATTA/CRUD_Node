// utils/seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Admin = require("../app/model/adminModel"); // Adjust path if needed
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;
    const role = "admin";

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin already exists");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Admin.create({ email, password: hashedPassword, name, role });
      console.log("✅ Admin created successfully");
    }

    await mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin(); // ✅ Call here only in this file
