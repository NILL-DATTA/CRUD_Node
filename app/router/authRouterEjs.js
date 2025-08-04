const express = require("express");
const router = express.Router();
const authControllerEjs = require("../controller/authControllerEjs");
const upload = require("../../middlware/middleware");
router.get("/user/login", authControllerEjs.loginview);
router.post("/create/login", authControllerEjs.createLogin);
router.get("/user/register", authControllerEjs.registerView);
router.post(
  "/create/register",
  upload.single("profileImage"),
  authControllerEjs.registerCreate
);

router.get("/user/otp", authControllerEjs.otpView);
router.post("/create/otp", authControllerEjs.verifyOtpCreate);

router.post("/forgot-password", authControllerEjs.resetPasswordLink);
router.get("/reset-password/:id/:token",authControllerEjs.passwordlinkview);

router.post("/reset-password/:id/:token", resetPassword);

router.get("/reset-success", showResetSuccessPage);
module.exports = router;
