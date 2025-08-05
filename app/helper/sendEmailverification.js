const transporter = require("../config/emailConfig");
const otpVerifyModel = require("../model/otpModel");

const sendEmailVerificationOTP = async (req, user) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  await new otpVerifyModel({
    userId: user._id,
    otp: otp,
  }).save();

  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: "OTP - Verify your account",
    html: `
      <p>Dear ${user.name},</p>
      <p>Thank you for signing up. Please verify your email using the following one-time password (OTP):</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 15 minutes.</p>
      <p>If you didn’t request this, please ignore this email.</p>
    `,
  });

  return otp;
};

module.exports = sendEmailVerificationOTP;
