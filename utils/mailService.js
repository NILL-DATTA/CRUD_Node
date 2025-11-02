// utils/sendOtpEmail.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP Email via Resend API
 * @param {string} to - Receiver email
 * @param {number} otp - OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  try {
    console.log(`📧 Sending OTP to: ${to} Code: ${otp}`);

    const response = await resend.emails.send({
      from: "YourApp <onboarding@resend.dev>", // or your verified domain email
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
    });

    if (response.error) {
      console.error("❌ Resend API Error:", response.error);
    } else {
      console.log("✅ Email sent successfully:", response);
    }
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};
