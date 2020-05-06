"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGO_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
function isURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(str);
}

var userUrlSchema = mongoose.Schema({
  original_url: String,
  short_url: Number,
});

var UserUrl = mongoose.model("UserUrl", userUrlSchema);

app.post("/api/shorturl/new", (req, res) => {
  let url = req.params.url;
  let short_url = "";

  if (isURL(url)) {
    // this means url is valid
    UserUrl.findOne({ original_url: url }, (err, data) => {
      if (data) {
        // this means url exists in the database
        res.json({ original_url: url, short_url: data.short_url });
      } else {
        // this means url is new
        let newUrl = new UserUrl({ original_url: url, short_url: Date.now() });

        newUrl.save((err) => {
          if (err) console.log(err);
        });

        res.json({ original_url: url, short_url: newUrl.short_url });
      }
    });
  } else {
    // this means url is invalid
    res.json({ error: "invalid URL" });
  }
});

// redirect user to original URL that was given
app.get("/api/shorturl/:id", function (req, res) {
  let id = req.params.id;

  UserUrl.findOne({ short_url: id }, function (err, data) {
    if (data) {
      res.redirect(data.short_url);
    } else {
      res.json({ error: "No short url found for given input" });
    }
  });
});

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log("Node.js listening ...");
});
