//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(
  "mongodb://127.0.0.1:27017/UserDB?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.0"
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save().then(res.render("secrets"));
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  //   User.findOne({ email: username })
  //     .then(if (err) {
  //         console.log("err");
  //       } else {
  //         if (foundUser) {
  //           if (foundUser.password === password) {
  //             res.render("secrets");
  //           }
  //         }
  //       })

  //   var myUser = User.findOne({ email: username });
  //   if (myUser.password === password) {
  //     res.render("secrets");
  //   }

  try {
    const user = await User.findOne({ email: username });
    if (!user) {
      res.status(401).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      if (user.password === password) {
        res.render("secrets");
      } else {
        console.log("password incorrect");
      }
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
});

app.listen(3000, function () {
  console.log("server started on port 3000 .");
});
