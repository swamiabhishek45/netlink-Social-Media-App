const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/smclonedb");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  passpord: String,
  profileImage: String,
  bio: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ]
})

// It provides serializeuser and deserializeuser methods which are used by the session middleware to manage sessions
userSchema.plugin(plm);

// It allows to do CRUD in DB
module.exports = mongoose.model("user", userSchema)