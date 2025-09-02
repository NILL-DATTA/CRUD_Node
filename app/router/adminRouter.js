const express = require("express");
const router = express.Router();
const AdminController = require("../controller/admin/authAdminController");
const adminAuth = require("../../middlware/adminAuth");

// ✅ Public route (no token required)
router.post("/admin/login",AdminController.adminLogin);

// ✅ Protected route example (requires token)
router.get("/admin/dashboard", adminAuth, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard", user: req.user });
});

module.exports = router;
