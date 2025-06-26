const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  subtitle: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
});

const postModel = mongoose.model("post", PostSchema);

module.exports = postModel;
