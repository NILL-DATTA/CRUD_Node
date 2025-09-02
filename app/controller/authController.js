const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../model/authModel");
const EmailVerifyModel = require("../model/otpModel");
const sendEmailVerificationOTP = require("../helper/sendEmailverification");
const nodemailer = require("nodemailer");
const {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  resetPasswordLinkSchema,
} = require("../../validators/authValidator");
class AuthController {
  // Register User
  async authRegister(req, res) {
    try {
      // 1. Validate request body using Joi
      const { error, value } = registerSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "All fields are require",
          errors: error.details.map((err) => err.message),
        });
      }

      const { name, email, password, address } = value;

      // 2. Check if profile image was uploaded
      const profileImage = req.file;
      if (!profileImage) {
        return res.status(400).json({
          status: false,
          message: "Profile image is required.",
        });
      }

      // 3. Check for existing user
      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists.",
        });
      }

      // 4. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5. Generate OTP and expiry
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = Date.now() + 15 * 60 * 1000; // 15 mins

      // 6. Create new user
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

      // 7. Send OTP email
      await sendEmailVerificationOTP(req, savedUser);

      // 8. Create token
      const token = jwt.sign(
        { id: savedUser._id, email: savedUser.email },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1d" }
      );

      // 9. Return response
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
      // ✅ Determine if data comes from body or query
      const isFromQuery = req.query?.email && req.query?.password;
      const input = isFromQuery ? req.query : req.body;

      // ✅ Validate input using Joi
      const { error, value } = loginSchema.validate(input, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
          errors: error.details.map((err) => err.message),
        });
      }

      const { email, password } = value;

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
      const userId = req?.user?.id;

      // ✅ Validate request body using Joi
      const { error, value } = updatePasswordSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: error.details.map((err) => err.message),
        });
      }

      const { oldPassword, newPassword } = value;

      // ✅ Find user
      const user = await Auth.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ✅ Compare old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      // ✅ Hash and update new password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      // ✅ Success response
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
      // ✅ Validate request body using Joi
      const { error, value } = verifyOtpSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "Validation Error",
          errors: error.details.map((err) => err.message),
        });
      }

      const { otp } = value;

      // ✅ Find emailVerification entry using OTP
      const emailVerification = await EmailVerifyModel.findOne({ otp });

      if (!emailVerification) {
        return res.status(400).json({
          status: false,
          message: "Invalid OTP, please request a new one.",
        });
      }

      // ✅ Fetch user using userId from OTP entry
      const existingUser = await Auth.findById(emailVerification.userId);

      if (!existingUser) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      if (existingUser.is_verified) {
        return res.status(400).json({
          status: false,
          message: "Email already verified",
        });
      }

      // ✅ Check OTP expiration
      const currentTime = new Date();
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );

      if (currentTime > expirationTime) {
        await EmailVerifyModel.deleteMany({ userId: existingUser._id });
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: false,
          message: "OTP expired. A new one has been sent to your email.",
        });
      }

      // ✅ Mark user as verified
      existingUser.is_verified = true;
      await existingUser.save();

      // ✅ Cleanup
      await EmailVerifyModel.deleteMany({ userId: existingUser._id });

      return res.status(200).json({
        status: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      return res.status(500).json({
        status: false,
        message: "Something went wrong. Please try again.",
      });
    }
  }
  async resetPasswordLink(req, res) {
    try {
      // ✅ Validate request body using Joi
      const { error, value } = resetPasswordLinkSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "Validation Error",
          errors: error.details.map((err) => err.message),
        });
      }

      const { email } = value;

      // ✅ Find user by email
      const user = await Auth.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "Email doesn't exist",
        });
      }

      // ✅ Generate JWT token for password reset
      const secret = user._id + process.env.JWT_SECRET;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "20m",
      });

      // ✅ Create reset link
      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;

      // ✅ Configure transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // ✅ Send reset email
      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject: "Password Reset Link",
        html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`,
      });

      // ✅ Success response
      return res.status(200).json({
        status: true,
        message: "Password reset email sent. Please check your email.",
      });
    } catch (error) {
      console.error("Reset password link error:", error);
      return res.status(500).json({
        status: false,
        message: "Unable to send password reset email. Please try again later.",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { id, token } = req.params;

      // ✅ Validate request body using Joi
      const { error, value } = resetPasswordSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "Validation Error",
          errors: error.details.map((err) => err.message),
        });
      }

      const { password, confirm_password } = value;

      // ✅ Find user
      const user = await Auth.findById(id);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      // ✅ Verify JWT token
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

      // ✅ Check password match
      if (password !== confirm_password) {
        return res.status(400).json({
          status: false,
          message: "New Password and Confirm New Password do not match",
        });
      }

      // ✅ Hash and update password
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      await Auth.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });

      return res.status(200).json({
        status: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        status: false,
        message: "Unable to reset password. Please try again later.",
      });
    }
  }
}
module.exports = new AuthController();
