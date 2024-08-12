const mongoose = require("mongoose");

// Defining a schema using Mongoose.
const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    title: String,
    caption: String,
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    comments: {
        type: Array,
        default: [],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    shares: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    picture: String,
});

// Exporting the model to be used in the application.
module.exports = mongoose.model("post", postSchema);
