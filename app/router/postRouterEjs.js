const express = require("express");
const router = express.Router();
const EjsApicontroller = require("../controller/apiControllerEjs");

router.get("/add/post", EjsApicontroller.add);
router.post("/post/create", EjsApicontroller.createPost);
router.get("/posts", EjsApicontroller.showPostList);

router.get("/edit/:id", EjsApicontroller.edit);
router.post("/update/:id", EjsApicontroller.update);

router.get("/delete/:id", EjsApicontroller.delete);
module.exports = router;
