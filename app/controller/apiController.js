const Post = require("../model/postModel");

class ApiController {
  //create student
  async createPost(req, res) {
    // console.log(req.body);
    //console.log('file image',req.file);
    try {
      const { title, subtitle, content } = req.body;
      const data = new Post({
        title,
        subtitle,
        content,
      });

      const sData = await data.save();
      if (sData) {
        return res.status(201).json({
          status: true,
          message: "Post created successfully",
          data: sData,
        });
      }
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async listPosts(req, res) {
    try {
      const posts = await Post.find().sort({ createdAt: -1 });
      return res.status(200).json({
        status: true,
        message: "Posts retrieved successfully",
        data: posts,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, subtitle, content } = req.body;

      if (!id || !title || !subtitle || !content) {
        return res.status(400).json({
          status: false,
          message: "ID, title, subtitle, and content are required.",
        });
      }

      const updatedData = {
        title,
        subtitle,
        content,
      };

      const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!updatedPost) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
    } catch (error) {
      console.error("Error updating post:", error.message);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getPostById(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Post retrieved successfully",
        data: post,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  async deletePost(req, res) {
    try {
      console.log("Delete route hit");

      const { id } = req.params;

      const deletedPost = await Post.findByIdAndDelete(id);

      if (!deletedPost) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Post deleted successfully",
        data: deletedPost,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}
module.exports = new ApiController();
