const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  imagePath: { type: String },
  is_verified: { type: Boolean, default: false },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Auth", AuthSchema);
