require("dotenv").config();
const express = require("express");
const connectDB = require("./app/config/dbcon");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");

// ------------------- MongoDB Connect -------------------
connectDB();

// ------------------- Initialize App -------------------
const app = express();

// ------------------- Middleware -------------------
app.use(cors());
app.use(morgan("combined"));

// ✅ Rate Limiter (optional)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  message: "Maximum limit hit. Please wait a minute.",
});
app.use(limiter);

// ✅ Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Sessions (use env secret)
app.use(
  session({
    secret: process.env.JWT_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Attach session user if present
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
});

// ------------------- Views & Static Files -------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// ------------------- API Routes -------------------
const postRoute = require("./app/router/postRouter");
app.use("/api", postRoute);

const authRoute = require("./app/router/authRouter");
app.use("/auth", authRoute);

// ------------------- EJS Routes -------------------
const EjspostRoute = require("./app/router/postRouterEjs");
app.use(EjspostRoute);

const EjsauthRoute = require("./app/router/authRouterEjs");
app.use(EjsauthRoute);

const AdminRoute = require("./app/router/adminRouter");
app.use(AdminRoute);

// ------------------- Default Route -------------------
app.get("/", (req, res) => {
  res.json({ message: "🚀 API is live and running on Render!" });
});

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ status: false, message: "Server error. Please try again later." });
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("✅ MongoDB URI Found:", process.env.MONGO_URI ? "Yes" : "No");
});
