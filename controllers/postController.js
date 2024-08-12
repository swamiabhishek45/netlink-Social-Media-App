// Import the Post model from the models/posts.js file
const Post = require("../models/posts");

// Export the getPost function to handle GET requests for a specific post
exports.getPost = async (req, res, next) => {
    // Use the findById method provided by Mongoose to retrieve the post with the given ID
    // from the database
    try {
        const post = await Post.findById(req.params.id);
        // If the post is not found, return a 404 HTTP status code with a message "Post not found"
        if (!post) {
            return res.status(404).send("Post not found");
        }
        // Render the post on a webpage using the res.render method provided by Express.js
        res.render("post", { post });
    } catch (error) {
        // Log the error to the console using the console.error method
        console.error(error);
        // Return a 500 HTTP status code with a message "Internal Server Error"
        res.status(500).send("Internal Server Error");
    }
};

// Export the deletePost function to handle DELETE requests for a specific post
exports.deletePost = async (req, res, next) => {
    // Use the findByIdAndDelete method provided by Mongoose to delete the post with the given ID
    // from the database
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        // If the post is not found, return a 404 HTTP status code with a message "Post not found"
        if (!deletedPost) {
            return res.status(404).send("Post not found");
        }
        // Redirect the user to the profile page or any other page after deletion
        res.redirect("/profile");
    } catch (error) {
        // Log the error to the console using the console.error method
        console.error(error);
        // Return a 500 HTTP status code with a message "Internal Server Error"
        res.status(500).send("Internal Server Error");
    }
};
