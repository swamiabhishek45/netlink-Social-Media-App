// controllers/postController.js
const Post = require("../models/posts");

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("post", { post });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).send("Post not found");
    }
    res.redirect("/profile"); // Redirect to home page or any other page after deletion
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
