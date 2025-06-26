const express = require("express");
const ApiController = require("../controller/apiController");
const verifyToken = require("../../middlware/authMiddleware");

const router = express.Router();
router.post("/post/create", verifyToken, ApiController.createPost);
router.get("/post/list", verifyToken, ApiController.listPosts);
router.put("/post/update/:id", verifyToken, ApiController.updatePost);
router.get("/post/:id", verifyToken, ApiController.getPostById);
router.delete("/delete/:id", verifyToken, ApiController.deletePost);
module.exports = router;
