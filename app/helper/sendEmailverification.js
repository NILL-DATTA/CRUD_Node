// helper/sendEmailVerificationOTP.js
const sgMail = require("@sendgrid/mail");
const otpVerifyModel = require("../model/otpModel");
require("dotenv").config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generate OTP, save to DB, and send email via SendGrid
 * @param {Object} user - User object { _id, name, email }
 * @param {number} otpLength - Optional OTP length (default 6)
 * @returns {number} otp - Generated OTP
 */
const sendEmailVerificationOTP = async (user, otpLength = 6) => {
  try {
    // 1️⃣ Generate OTP
    const otp = Math.floor(
      Math.pow(10, otpLength - 1) + Math.random() * 9 * Math.pow(10, otpLength - 1)
    );

    // 2️⃣ Save OTP to DB
    await new otpVerifyModel({
      userId: user._id,
      otp: otp,
      createdAt: new Date(),               // optional
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
    }).save();

    // 3️⃣ Prepare email
    const msg = {
      to: user.email,
      from: process.env.SMTP_EMAIL, // verified sender in SendGrid
      subject: "OTP - Verify your account",
      html: `
        <p>Dear ${user.name},</p>
        <p>Thank you for signing up. Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 15 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    };

    // 4️⃣ Send OTP email
    await sgMail.send(msg);
    console.log("✅ OTP email sent to", user.email);

    // 5️⃣ Return OTP
    return otp;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendEmailVerificationOTP;
