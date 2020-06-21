//jshint esversion:6
require('dotenv').config();
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        User.findOne({ email: req.body.username}, function (err, foundUser) {
            if (!err) {
                if (foundUser != undefined) {
                    if (foundUser.password === req.body.password) {
                        res.render("secrets");
                    }
                } else {
                    res.send("No user")
                }
            } else {
                console.log(err);
            }
        })
    })

app.route("/register")
    .get(function (req, res) {
        res.render("register");
    })

    .post(function (req, res) {
        const email = req.body.username;
        const password = req.body.password;
        const newUser = new User({
            email: email,
            password: password
        })
        newUser.save(function (err) {
            if (!err) {
                res.render("secrets");
            } else {
                console.log(err);
            }
        });
    })


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});