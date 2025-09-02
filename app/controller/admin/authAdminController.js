const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginSchema = require("../../../validators/adminSchema"); // adjust path if needed
const admin = require("../../model/adminModel"); // assuming this is your Mongoose model

module.exports = {
  async adminLogin(req, res) {
    try {
      // ✅ Determine source of input

      const input = req.body;
      console.log(req.body, "req.body");

      // ✅ Validate input with Joi
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

      // ✅ Find admin by email
      const existingUser = await admin.findOne({ email });

      console.log(existingUser, "existingUser");
      if (!existingUser) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password.",
        });
      }

      // ✅ Check if user is admin
      if (existingUser.role !== "admin") {
        return res.status(403).json({
          status: false,
          message: "Access denied. Admins only.",
        });
      }

      // ✅ Validate password
      const isMatch = await bcrypt.compare(password, existingUser.password);

      console.log(isMatch, "isMatch");
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
          role: existingUser.role,
        },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1d" }
      );

      console.log(token, "token");
      // ✅ Respond with success
      return res.status(200).json({
        status: true,
        message: "Admin logged in successfully",
        admin: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
        token,
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({
        status: false,
        message: "Server error. Please try again later.",
      });
    }
  },
};
