var express = require("express");
var router = express.Router();
const userModel = require("../models/users");
const postsModel = require("../models/posts");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const utils = require("../utils/utils");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
    res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
    res.render("login", { footer: false });
});

router.get("/like/:postid", async function (req, res) {
    const post = await postsModel.findOne({ _id: req.params.postid });
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
    if (post.like.indexOf(user._id) === -1) {
        post.like.push(user._id);
    } else {
        post.like.splice(post.like.indexOf(user._id), 1);
    }
    await post.save();
    res.json(post);
});

router.get("/feed", isLoggedIn, async function (req, res) {
    const user = await userModel
        .findOne({ username: req.session.passport.user })
        .populate("posts");
    const posts = await postsModel.find().populate("user");
    res.render("feed", {
        footer: true,
        posts,
        user,
        dater: utils.formatRelativeTime,
    });
});

router.get("/profile", isLoggedIn, async function (req, res) {
    const user = await userModel
        .findOne({ username: req.session.passport.user })
        .populate("posts")
        .populate("saved");
    res.render("myprofile", {
        footer: true,
        user,
        dater: utils.formatRelativeTime,
    });
});

// user profile route
router.get("/profile/:user", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ username: req.session.passport.user });

    if (user.username === req.params.user) {
        res.redirect("/profile");
    }

    let userprofile = await userModel
        .findOne({ username: req.params.user })
        .populate("posts");

    res.render("userprofile", {
        footer: true,
        userprofile,
        user,
        dater: utils.formatRelativeTime,
    });
});

// follwers $ following route
router.get("/follow/:userid", isLoggedIn, async function (req, res) {
    let followKarneWaala = await userModel.findOne({
        username: req.session.passport.user,
    });

    let followHoneWaala = await userModel.findOne({ _id: req.params.userid });

    if (followKarneWaala.following.indexOf(followHoneWaala._id) !== -1) {
        let index = followKarneWaala.following.indexOf(followHoneWaala._id);
        followKarneWaala.following.splice(index, 1);

        let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
        followHoneWaala.followers.splice(index2, 1);
    } else {
        followHoneWaala.followers.push(followKarneWaala._id);
        followKarneWaala.following.push(followHoneWaala._id);
    }

    await followHoneWaala.save();
    await followKarneWaala.save();

    res.redirect("back");
});

router.get("/search", isLoggedIn, async function (req, res) {
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
    res.render("search", { footer: true, user });
});

router.get("/search/:user", isLoggedIn, async function (req, res) {
    const searchTerm = `^${req.params.user}`;
    const regex = new RegExp(searchTerm);

    let users = await userModel.find({ username: { $regex: regex } });

    res.json(users);
});

router.get("/user", isLoggedIn, async function (req, res) {
    let users = await userModel.find({ username: req.session.passport.user });

    res.json(users);
});

router.get("/save/:postid", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ username: req.session.passport.user });

    if (user.saved.indexOf(req.params.postid) === -1) {
        user.saved.push(req.params.postid);
    } else {
        var index = user.saved.indexOf(req.params.postid);
        user.saved.splice(index, 1);
    }
    await user.save();
    res.json(user);
});

router.get("/edit", isLoggedIn, async function (req, res) {
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
    res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, async function (req, res) {
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
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
        user.profileImage = req.file.filename
            ? req.file.filename
            : "../public/images/profile.jpg";
    }
    await user.save();

    req.login(user, function (err) {
        if (err) throw err;
        res.redirect("/profile");
    });
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
