var mongoose = require("mongoose");
const _ = require("lodash");
const shortid = require("shortid");

// Exercise schema
var exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

// User schema
var userSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: shortid.generate,
  },
  username: {
    type: String,
    required: true,
  },
});

// Models
var User = mongoose.model("User", userSchema);
var Exercise = mongoose.model("Exercise", exerciseSchema);

exports.addUser = (req, res) => {
  var newUser = new User({
    username: req.body.username,
  });
  newUser
    .save()
    .then((user) => {
      res.status(200).json({
        username: user.username,
        _id: user._id,
      });
    })
    .catch((err) => {
      res.status(500).send({
        error: err,
      });
    });
};

exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({
        error: err,
      });
    });
};

exports.addExercise = (req, res) => {
  let newExercise = new Exercise({
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date || new Date(),
  });

  newExercise.save().then((exercise) => {
    User.findById(exercise.userId)
      .then((user) => {
        res.send({
          username: user.username,
          description: exercise.description,
          duration: exercise.duration,
          _id: user._id,
          date: exercise.date.toDateString(),
        });
      })
      .catch((err) => {
        res.status(500).send({
          error: err,
        });
      })
      .catch((err) => {
        res.status(500).send({
          error: err,
        });
      });
  });
};

exports.getLogs = (req, res) => {
  User.findById(req.query.userId)
    .then((user) => {
      if (req.query.from && req.query.to) {
        Exercise.find({
          $and: [
            { userId: user._id },
            { date: { $gte: new Date(req.query.from) } },
            { date: { $lte: new Date(req.query.to) } },
          ],
        })
          .limit(Number(req.query.limit) || 100)
          .then((exercises) => {
            console.log(exercises);
            var newExecs = exercises.map((exe) => {
              var execs = _.pick(exe, ["description", "duration", "date"]);
              execs.date = execs.date.toDateString();
              return execs;
            });
            res.status(200).json({
              _id: user._id,
              username: user.username,
              count: exercises.length,
              log: newExecs,
            });
          })
          .catch((err) => {
            res.status(500).send({
              error: err,
            });
          });
      } else {
        Exercise.find({ userId: user._id })
          .limit(Number(req.query.limit) || 100)
          .then((exercises) => {
            console.log(exercises);
            var newExecs = exercises.map((exe) => {
              var execs = _.pick(exe, ["description", "duration", "date"]);
              execs.date = execs.date.toDateString();
              return execs;
            });
            res.status(200).json({
              _id: user._id,
              username: user.username,
              count: exercises.length,
              log: newExecs,
            });
          })
          .catch((err) => {
            res.status(500).send({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({
        error: err,
      });
    });
};
