var express = require("express");
var router = express.Router();
const userModel = require("../models/users");
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
  const user = await userModel.findOne({
    username: req.session.passport.username,
  });
  res.render("feed", { footer: true, user });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("myprofile", { footer: true, user });
});

router.get("/search", isLoggedIn,  function (req, res) {
 res.render("search", { footer: true });
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, function (req, res) {
  res.render("upload", { footer: true });
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
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

// logout route
router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// update route
router.post("/update", upload.single("image"), async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, tagline: req.body.tagline, bio: req.body.bio },
    { new: true }
  );
  if (req.file) {
    user.picture = req.file.filename;
  }
  await user.save();
  res.redirect("/profile");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
