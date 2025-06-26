require("dotenv").config();
const express = require("express");
const connectDB = require("./app/config/dbcon");
const path = require("path");
const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const postRoute = require("./app/router/postRouter");
app.use("/api", postRoute);

const authRoute = require("./app/router/authRouter");
app.use("/auth", authRoute);

app.use("/uploads", express.static("uploads"));

const EjspostRoute = require("./app/router/postRouterEjs");
app.use(EjspostRoute);

app.listen(4000, () => {
  console.log("Server is running at http://localhost:4000");
});
