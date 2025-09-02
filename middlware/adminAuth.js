const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );

    // Attach user to request
    req.user = decoded;

    // Only allow if role is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = adminAuth;
