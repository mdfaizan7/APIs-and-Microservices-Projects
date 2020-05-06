const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
const cors = require("cors");
var mongoose = require("mongoose");
mongoose.connect(process.env.MLAB_URI || "mongodb://localhost/exercise-track", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const { getLogs, addUser, getAllUsers, addExercise } = require("./controllers");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Add new user
app.post("/api/exercise/new-user", upload.none(), addUser);

// get all users
app.get("/api/exercise/users", getAllUsers);

//add a exercise
app.post("/api/exercise/add", upload.none(), addExercise);

//get logs
app.get("/api/exercise/log", getLogs);

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res.status(errCode).type("txt").send(errMessage);
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
