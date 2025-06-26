const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../model/authModel");
const EmailVerifyModel = require("../model/otpModel");
const sendEmailVerificationOTP = require("../helper/sendEmailverification");
const StatusCode = require("../helper/status");
const nodemailer = require("nodemailer");
const { transporter } = require("../config/emailConfig");
class AuthController {
  // Register User
  async authRegister(req, res) {
    try {
      const { name, email, password, confirmPassword, address } = req.body;
      const profileImage = req.file;

      // 1. Validation
      if (
        !name ||
        !email ||
        !password ||
        !confirmPassword ||
        !address ||
        !profileImage
      ) {
        return res.status(400).json({
          status: false,
          message: "All fields are required, including profile image.",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Password and Confirm Password do not match.",
        });
      }

      // 2. Check for existing user
      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists.",
        });
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Generate OTP and expiry
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = Date.now() + 15 * 60 * 1000; // 15 mins

      // 5. Create new user
      const newUser = new Auth({
        name,
        email,
        address,
        imagePath: profileImage.path,
        password: hashedPassword,
        verifyOtp: otp,
        verifyOtpExpire: otpExpire,
        isVerified: false,
      });

      const savedUser = await newUser.save();

      // 6. Send OTP email
      await sendEmailVerificationOTP(req, savedUser);

      // 7. Create token
      const token = jwt.sign(
        { id: savedUser._id, email: savedUser.email },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1d" }
      );

      // 8. Return response
      return res.status(201).json({
        status: true,
        message: "User registered successfully. OTP sent for verification.",
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          address: savedUser.address,
          imagePath: savedUser.imagePath,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        status: false,
        message: "Server error. Please try again later.",
      });
    }
  }

  async authLogin(req, res) {
    try {
      // ✅ Get email and password from body or query
      const email = req.body?.email || req.query?.email;
      const password = req.body?.password || req.query?.password;

      // ✅ Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "All fields (email, password) are required.",
        });
      }

      // ✅ Check if user exists
      const existingUser = await Auth.findOne({ email });
      if (!existingUser) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password.",
        });
      }

      // ✅ Compare password
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password.",
        });
      }

      // ✅ Generate JWT token
      const token = jwt.sign(
        {
          id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
        },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1d" }
      );

      // ✅ Send success response
      return res.status(200).json({
        status: true,
        message: "User logged in successfully",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        status: false,
        message: "Server error. Please try again later.",
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body || {};
      const userId = req?.user?.id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Both old and new password are required",
        });
      }

      const user = await Auth.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Update password error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  }

  async profilePosts(req, res) {
    try {
      const userId = req.user.id;
      const user = await Auth.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      return res.status(200).json({
        status: true,
        message: "Profile details fetched successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body || {};

      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }
      const existingUser = await Auth.findOne({ email });

      // Check if email doesn't exists
      if (!existingUser) {
        return res
          .status(404)
          .json({ status: "failed", message: "Email doesn't exists" });
      }

      // Check if email is already verified
      if (existingUser.is_verified) {
        return res
          .status(400)
          .json({ status: false, message: "Email is already verified" });
      }
      // Check if there is a matching email verification OTP
      const emailVerification = await EmailVerifyModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          // console.log(existingUser);
          await sendEmailVerificationOTP(req, existingUser);
          return res.status(400).json({
            status: false,
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }
      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: "failed",
          message: "OTP expired, new OTP sent to your email",
        });
      }
      // OTP is valid and not expired, mark email as verified
      existingUser.is_verified = true;
      await existingUser.save();

      // Delete email verification document
      await EmailVerifyModel.deleteMany({ userId: existingUser._id });
      return res
        .status(200)
        .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }

  async resetPasswordLink(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ status: false, message: "Email field is required" });
      }

      const user = await Auth.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "Email doesn't exist" });
      }

      const secret = user._id + process.env.JWT_SECRET;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "20m",
      });

      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;

      // ✅ Define transporter here
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // ✅ Send email
      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject: "Password Reset Link",
        html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`,
      });

      return res.status(200).json({
        status: true,
        message: "Password reset email sent. Please check your email.",
      });
    } catch (error) {
      console.log("Email send error:", error);
      return res.status(500).json({
        status: false,
        message: "Unable to send password reset email. Please try again later.",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { password, confirm_password } = req.body || {};
      const { id, token } = req.params;
      console.log(password, "password");
      console.log(confirm_password, "password");
      const user = await Auth.findById(id);
      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "User not found" });
      }

      const new_secret = user._id + process.env.JWT_SECRET;
      try {
        jwt.verify(token, new_secret);
      } catch (err) {
        console.error("JWT VERIFY ERROR:", err.message);
        return res.status(400).json({
          status: false,
          message: "Invalid or expired token",
        });
      }
      if (password !== confirm_password) {
        return res.status(400).json({
          status: false,
          message: "New Password and Confirm New Password don't match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      await Auth.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });

      return res.status(200).json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        status: "failed",
        message: "Unable to reset password. Please try again later.",
      });
    }
  }
}
module.exports = new AuthController();
