const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL, // Admin Gmail ID
    pass: process.env.SMTP_PASSWORD, // Admin Gmail Password
  },
});

module.exports = transporter;
