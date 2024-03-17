require("dotenv").config();
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// mongoose.connect(
//   `mongodb+srv://swamiabhishek45:abhi1234@cluster0.xaiz65q.mongodb.net`
// );

// mongoose.connect(`${process.env.MONGODB_URI}`);

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  tagline: String,
  username: String,
  email: String,
  password: String,
  profileImage: String,
  bio: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

// It provides serializeuser and deserializeuser methods which are used by the session middleware to manage sessions
userSchema.plugin(plm);

// It allows to do CRUD in DB
module.exports = mongoose.model("user", userSchema);
