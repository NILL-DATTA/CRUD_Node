const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req?.body?.token || req?.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({
      status: false,
      message: "A token is required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
