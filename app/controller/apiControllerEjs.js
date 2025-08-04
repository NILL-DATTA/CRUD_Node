const Post = require("../model/postModel");

class EjsApicontroller {
  async showPostList(req, res) {
    try {
      const posts = await Post.find({});
      res.render("list", { posts });
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).send("Server Error");
    }
  }

  async add(req, res) {
    try {
      res.render("home");
    } catch (err) {
      console.log(err);
    }
  }

  async createPost(req, res) {
    try {
      const userId = req.session?.user?.id; // Get logged-in user ID from session

      if (!userId) {
        console.log("User not logged in");
        return res.redirect("/user/login");
      }

      const post = new Post({
        title: req.body.title,
        subtitle: req.body.subtitle,
        content: req.body.content,
        userId: userId, // Assign logged-in user's ID
      });

      const result = await post.save();

      if (result) {
        console.log("Content saved successfully:", result);
        return res.redirect("/posts");
      } else {
        console.log("Failed to save content.");
        return res.redirect("/add/post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).send("Server Error");
    }
  }

  async edit(req, res) {
    try {
      const id = req.params.id;
      const editdata = await Post.findById(id);
      res.render("edit", {
        title: "edit-page",
        data: editdata,
      });
    } catch (err) {
      console.error("Error fetching post details:", err);
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const editdata = await Post.findByIdAndUpdate(id, req.body);
      res.redirect("/posts");
    } catch (err) {
      console.error("Error fetching post details:", err);
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      await Post.findByIdAndDelete(id);
      res.redirect("/posts");
    } catch (error) {
      console.error("Delete error:", error);
    }
  }
}

module.exports = new EjsApicontroller();
