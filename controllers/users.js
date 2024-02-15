const { JWT_SECRET } = require("../utils/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const user = require("../models/user");
const User = require("../models/user");
const {
  INVALID_DATA_ERROR,
  NOTFOUND_ERROR,
  DEFAULT_ERROR,
  CONFLICT_ERROR,
  UNAUTHORIZED_ERROR,
} = require("../utils/errors");

const updateUser = (req, res) => {
  const id = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    id,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("user not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === "User not found") {
        res.status(NOTFOUND_ERROR.send({ message: err.message }));
      } else if (err.name === "ValidationError") {
        res.status(INVALID_DATA_ERROR.send({ message: err.message }));
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Internal server error" });
      }
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!email) {
        throw new Error("Enter a valid email");
      }
      if (user) {
        throw new Error("Email is already in use");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userPayload = user.toObject();
      delete userPayload.password;
      res.status(201).send({
        data: userPayload,
      });
    })

    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid request error on createUser" });
      } else if (err.message === "Enter a valid email") {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid error on createUser" });
      } else if (err.message === "Email is already in use") {
        res.status(CONFLICT_ERROR).send({ message: "Email already exists" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: err.message });
      }
    });
};

const getCurrentUser = (req, res) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("User not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "User not found") {
        res.status(NOTFOUND_ERROR).send({ message: err.message });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Internal server error" });
      }
    });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(INVALID_DATA_ERROR).send({ message: "Invalid credentials" });
    return;
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        res.status(UNAUTHORIZED_ERROR).send({ message: "Invalid credentials" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: err.message });
      }
    });
};

module.exports = { updateUser, getCurrentUser, createUser, loginUser };
