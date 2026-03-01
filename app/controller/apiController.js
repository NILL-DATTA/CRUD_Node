const {
  createPostSchema,
  updatePostSchema,
} = require("../../validators/postValidator");
const Post = require("../model/postModel");

class ApiController {
  //create student
  async createPost(req, res) {
    try {
      // Validate request body
      const { error, value } = createPostSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "All fileds are required",
          errors: error.details.map((err) => err.message),
        });
      }

      const { title, subtitle, content } = value;
      const userId = req.user.id;

      const data = new Post({
        title,
        subtitle,
        content,
        userId,
      });

      const savedPost = await data.save();

      return res.status(201).json({
        status: true,
        message: "Post created successfully",
        data: savedPost,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async listPosts(req, res) {
    console.log(req.user.id, "k");
    try {
      const userId = req.user.id;

      const posts = await Post.find({ userId }).sort({ createdAt: -1 });
      if (posts.length === 0) {
        return res.status(201).json({
          status: true,
          message: "No posts found for this user.",
          data: [],
        });
      }

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

      if (!id) {
        return res.status(400).json({
          status: false,
          message: "Post ID is required",
        });
      }

      // Validate request body
      const { error, value } = updatePostSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          status: false,
          message: "All fileds are required",
          errors: error.details.map((err) => err.message),
        });
      }

      const updatedPost = await Post.findByIdAndUpdate(id, value, {
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
