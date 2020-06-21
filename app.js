//jshint esversion:6
require('dotenv').config();
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        User.findOne({ email: req.body.username }, function (err, foundUser) {
            if (!err) {
                if (foundUser != undefined) {
                    const hash = foundUser.password;
                    bcrypt.compare(req.body.password, hash, function (err, result) {
                        if (!err) {                      
                            if (result) {
                                res.render("secrets");
                            }
                            else {
                                res.send("Uncorrect password");
                            }
                        }
                    });
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
        bcrypt.hash(password, saltRounds, function (err, hash) {
            const newUser = new User({
                email: email,
                password: hash
            })
            newUser.save(function (err) {
                if (!err) {
                    res.render("secrets");
                } else {
                    console.log(err);
                }
            });
        });

    })


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});