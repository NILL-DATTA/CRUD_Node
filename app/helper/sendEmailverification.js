const nodemailer = require("nodemailer");
const EmailVerifyOTP = require("../model/otpModel");

const sendEmailVerificationOTP = async (user) => {
  try {
    if (!user || !user._id || !user.email) {
      throw new Error("Invalid user object");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Remove old OTPs
    await EmailVerifyOTP.deleteMany({ userId: user._id.toString() });

    console.log("➡️ Saving OTP for user:", user._id.toString());
    const saved = await new EmailVerifyOTP({
      userId: user._id.toString(),
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }).save();
    console.log("✅ OTP Saved:", saved);
    console.log("📌 OTP saved in DB:", saved);

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"YourApp" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: "Your OTP Code",
      html: `
        <p>Hello ${user.name},</p>
        <p>Your OTP code is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent to:", user.email);

    return saved; // saved document with OTP
  } catch (error) {
    console.error("❌ OTP sending failed:", error);
    throw error;
  }
};

module.exports = sendEmailVerificationOTP;
