require("dotenv").config();
const express = require("express");
const connectDB = require("./app/config/dbcon");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "maximum limit hit",
});
const app = express();
connectDB();

app.use(cors());
app.use(morgan("combined"));

app.use(limiter);

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions for EJS login
app.use(
  session({
    secret: "JWT_SECRET",
    resave: false,
    saveUninitialized: false,
  })
);

// Set req.user from session
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
});

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// API Routes
const postRoute = require("./app/router/postRouter");
app.use("/api", postRoute);

const authRoute = require("./app/router/authRouter");
app.use("/auth", authRoute);

// EJS Routes
const EjspostRoute = require("./app/router/postRouterEjs");
app.use(EjspostRoute);

const EjsauthRoute = require("./app/router/authRouterEjs");
app.use(EjsauthRoute);

// Start server
app.listen(4000, () => {
  console.log("Server is running at http://localhost:4000");
});
