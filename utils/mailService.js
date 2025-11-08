// // services/mailService.js
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// // Initialize Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || "smtp.gmail.com",
//   port: Number(process.env.EMAIL_PORT) || 465,
//   secure: true, // SSL for port 465
//   auth: {
//     user: process.env.SMTP_EMAIL,
//     pass: process.env.SMTP_PASSWORD, // Gmail App Password
//   },
// });

// /**
//  * Send OTP Email via Nodemailer
//  * @param {string} to - Receiver email
//  * @param {number} otp - OTP code
//  */
// export const sendOtpEmail = async (to, otp) => {
//   try {
//     console.log(`📧 Sending OTP to: ${to} | Code: ${otp}`);

//     const info = await transporter.sendMail({
//       from: `"YourApp" <${process.env.SMTP_EMAIL}>`,
//       to,
//       subject: "Your OTP Code",
//       html: `
//         <div style="font-family:sans-serif; line-height:1.6">
//           <h2>Welcome to YourApp 👋</h2>
//           <p>Your OTP code is:</p>
//           <h3 style="color:#2b6cb0;">${otp}</h3>
//           <p>This code will expire in 5 minutes.</p>
//         </div>
//       `,
//     });

//     console.log("✅ Email sent successfully:", info.response);
//     return info;
//   } catch (error) {
//     console.error("❌ Error sending OTP email:", error);
//     throw error;
//   }
// };
