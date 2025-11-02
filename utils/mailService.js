import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"YourApp" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:sans-serif; line-height:1.6">
          <h2>Welcome to YourApp 👋</h2>
          <p>Your OTP code is:</p>
          <h3 style="color:#2b6cb0;">${otp}</h3>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};
