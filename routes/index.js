var express = require("express");
var router = express.Router();
const userModel = require("../models/users");
const postsModel = require("../models/posts");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postsModel.find().populate("user");
  res.render("feed", { footer: true, posts, user });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render("myprofile", { footer: true, user });
});

router.get("/search", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("search", { footer: true, user });
});

// TODO: like route 
router.get("/like/post/:id", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postsModel.findOne({ _id: req.params.id });

  post.like.indexOf(user._id);
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("upload", { footer: true, user });
});

router.get("/username/:username", isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, "i");
  const users = await userModel.find({ username: regex });
  res.json(users);
});

// register route
router.post("/register", function (req, res) {
  const userData = new userModel({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    tagline: req.body.tagline,
    username: req.body.username,
    email: req.body.email,
    // profileImage: req.body.profileImage || "defaultProfile.png",
  });

  // create a new user in the database using our User model then redirect to profile page
  userModel.register(userData, req.body.password).then(() => {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

// login route
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

// logout route
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// update route
router.post("/update", upload.single("image"), async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      tagline: req.body.tagline,
      bio: req.body.bio,
    },
    { new: true }
  );
  if (req.file) {
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect("/profile");
});

router.post(
  "/upload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postsModel.create({
      picture: req.file.filename,
      user: user._id,
      caption: req.body.caption,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/feed");
  }
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
