const mongoose = require("mongoose");

const otpVerifySchema = new mongoose.Schema(
  {
    userId: {
      type: String, // string type for simplicity
      required: true,
    },
    otp: {
      type: String, // string
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailVerifyOTP", otpVerifySchema);
