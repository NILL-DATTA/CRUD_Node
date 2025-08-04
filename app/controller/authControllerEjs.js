const createToken = require("../helper/createToken");
const sendEmailVerificationOTP = require("../helper/sendEmailverification");
const Auth = require("../model/authModel");
const bcrypt = require("bcrypt");
const EmailVerifyModel = require("../model/otpModel");

class AuthControllerEjs {
  // Render login form
  async loginview(req, res) {
    try {
      res.render("login");
    } catch (err) {
      console.error("Render error:", err);
    }
  }

  // Handle login form submission
  async createLogin(req, res) {
    console.log(req.body);

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("All input is required");
        res.redirect("/user/login"); // ✅ Return after redirect
      }

      const user = await Auth.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        const tokendata = await createToken({
          id: user._id,
          name: user.name,
          email: user.email,
        });

        if (tokendata) {
          res.cookie("userToken", tokendata);
          return res.redirect("/posts"); // ✅ Redirect to your EJS posts page
        }
      }

      console.log("Login failed");
      return res.redirect("/user/login"); // ✅ Redirect again on failure
    } catch (err) {
      console.error("Login error:", err);
      return res.redirect("/user/login");
    }
  }

  async registerView(req, res) {
    try {
      res.render("register");
    } catch (err) {
      console.error("Render error:", err);
    }
  }

  async registerCreate(req, res) {
    try {
      const { name, email, password, address, confirmPassword } =
        req.body || {};
      console.log(address, "ju");

      // ✅ 1. Basic validation
      if (!name || !email || !password || !address || !confirmPassword) {
        console.log("All fields are required");
        return res.redirect("/user/register");
      }

      if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return res.redirect("/user/register");
      }

      // ✅ 2. Check if user already exists
      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        console.log("User already exists");
        return res.redirect("/user/register");
      }

      // ✅ 3. Hash the password
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      // ✅ 4. Get uploaded file (if using multer)
      const file = req.file ? req.file.filename : "";

      // ✅ 5. Create user
      const user = new Auth({
        name,
        email,
        address,
        password: hashedPassword,
        profileImage: file,
      });

      const result = await user.save();
      console.log(result, "kk");

      if (result) {
        console.log("Register successfully");
        await sendEmailVerificationOTP(req, user);
        return res.render("otp", { email: user.email, error: null });
      } else {
        console.log("Register failed");
        return res.redirect("/user/register");
      }
    } catch (err) {
      console.error("Register error:", err);
      res.redirect("/user/register");
    }
  }

  async otpView(req, res) {
    try {
      res.render("otp");
    } catch (err) {
      console.error("Render error:", err);
    }
  }

  async verifyOtpCreate(req, res) {
    try {
      const { otp } = req.body || {};

      if (!otp || typeof otp !== "string" || !otp.trim()) {
        return res.render("otp", {
          error: "OTP is required",
          success: null,
        });
      }

      const cleanedOtp = otp.trim();
      console.log(cleanedOtp, "hello");
      // Find emailVerification entry using OTP
      const emailVerification = await EmailVerifyModel.findOne({
        otp: cleanedOtp,
      });
      console.log(emailVerification, "emailVerification");
      if (!emailVerification) {
        return res.render("otp", {
          error: "Invalid OTP. Please request a new one.",
          success: null,
        });
      }

      // Fetch user using userId from OTP entry
      const existingUser = await Auth.findById(emailVerification.userId);
      console.log(existingUser, "existingUser");
      if (!existingUser) {
        return res.render("otp", {
          error: "User not found",
          success: null,
        });
      }

      if (existingUser.is_verified) {
        return res.render("otp", {
          error: "Email already verified",
          success: null,
        });
      }

      // Check OTP expiration (15 mins)
      const currentTime = new Date();
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );

      if (currentTime > expirationTime) {
        await EmailVerifyModel.deleteMany({ userId: existingUser._id });
        await sendEmailVerificationOTP(existingUser.email, generateOtp());

        return res.render("otp", {
          error: "OTP expired. A new one has been sent to your email.",
          success: null,
        });
      }

      // Mark user as verified
      existingUser.is_verified = true;
      await existingUser.save();

      // Clean up used OTP
      await EmailVerifyModel.deleteMany({ userId: existingUser._id });
      console.log("✅ OTP verified successfully for user:", existingUser.email);
      res.redirect("/user/login");
      return res.render("otp", {
        error: null,
        success: "Email verified successfully!",
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      return res.render("otp", {
        error: "Something went wrong. Please try again.",
        success: null,
      });
    }
  }

  async passwordLinkView(req, res) {
    try {
      res.render("updatePassword"); // form where user inputs email
    } catch (err) {
      console.error("Render error:", err);
      res.status(500).render("reset", { errorMessage: "Server error" });
    }
  }

  async resetpasswordejs(req, res) {
    try {
      res.render("updatePassWord");
    } catch (err) {
      console.error("Render error:", err);
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
        return res.status(404).render("reset-password-email-sent"); // Still show success page
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

      // ✅ Render EJS page
      return res.status(200).render("reset-password-email-sent");
    } catch (error) {
      console.error("Reset password link error:", error);
      return res.status(500).render("reset-password-email-sent", {
        errorMessage:
          "Unable to send password reset email. Please try again later.",
      });
    }
  }
  async resetPassword(req, res) {
    const { id, token } = req.params;

    try {
      // Validate request body using Joi
      const { error, value } = resetPasswordSchema.validate(req.body, {
        abortEarly: false,
      });

      let locals = { errors: [] };

      if (error) {
        locals.errors = error.details.map((err) => err.message);
      }

      // Find user
      const user = await Auth.findById(id);
      if (!user) {
        locals.errors.push("User not found");
      }

      // Verify JWT token
      const new_secret = user._id + process.env.JWT_SECRET;
      try {
        jwt.verify(token, new_secret);
      } catch (err) {
        console.error("JWT VERIFY ERROR:", err.message);
        locals.errors.push("Invalid or expired token");
      }

      // Check password match
      const { password, confirm_password } = value || {};
      if (password !== confirm_password) {
        locals.errors.push(
          "New Password and Confirm New Password do not match"
        );
      }

      // If any errors, re-render the form with error list
      if (locals.errors.length > 0) {
        return res.render("reset-password", locals);
      }

      // Hash and update password
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      await Auth.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });

      // Redirect to success page
      return res.redirect("/reset-success");
    } catch (error) {
      console.error("Reset password error:", error);
      locals.errors.push("Unable to reset password. Please try again later.");
      return res.render("reset-password", locals);
    }
  }
}

module.exports = new AuthControllerEjs();
