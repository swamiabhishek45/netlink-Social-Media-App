require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressSession = require("express-session");
const mongoose = require("mongoose");
const DB_NAME = require("./constants.js");

var indexRouter = require("./routes/index");
var usersRouter = require("./models/users");
const passport = require("passport");

var app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`).then(() => {
  console.log("MONGODB Connected !!!");
});

const postController = require("./controllers/postController");
// app.get("/posts/:id", postController.getPost);
app.post("/posts/:id/delete", postController.deletePost);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// this code ALLOWs to save data on server
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "This is my secret",
  })
),
  app.use(passport.initialize()); // Allow users to logged in always
app.use(passport.session()); // save data on server
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(PORT, () => {
  console.log(`Server is listening on PORT ${process.env.PORT}`);
});

module.exports = app;
