const express = require("express");
const AuthController = require("../controller/authController");

const router = express.Router();
const upload = require("../../middlware/middleware");
const verifyToken = require("../../middlware/authMiddleware");

router.post(
  "/register",
  upload.single("profileImage"),
  AuthController.authRegister
);
router.post("/login", AuthController.authLogin);
router.put("/update-password", verifyToken, AuthController.updatePassword);
router.get("/profile", verifyToken, AuthController.profilePosts);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/reset-password-link", AuthController.resetPasswordLink);
router.post("/reset-password/:id/:token", AuthController.resetPassword);
module.exports = router;
