const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const NotFoundError = require("../errors/notFoundError");
const InvalidError = require("../errors/invalidError");
const ForbiddenError = require("../errors/forbiddenError");
const UnauthorizedError = require("../errors/unauthorizedError");
const ConflictError = require("../errors/conflictError");
// const {
//   INVALID_DATA_ERROR,
//   NOTFOUND_ERROR,
//   DEFAULT_ERROR,
//   CONFLICT_ERROR,
//   UNAUTHORIZED_ERROR,
// } = require("../utils/errors");

const updateUser = (req, res, next) => {
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
        return next(new NotFoundError("user not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === "User not found") {
        next(new NotFoundError("User not found"));
      } else if (err.name === "ValidationError") {
        next(new InvalidError("Validation Error"));
      } else {
        next(err);
        // res.status(DEFAULT_ERROR).send({ message: "Internal server error" });
      }
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!email) {
        // throw new Error("Enter a valid email");
        return next(new InvalidError("Enter a valid email"));
      }
      if (user) {
        // throw new Error("Email is already in use");
        return next(new ConflictError("Email is already in use"));
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
        next(new InvalidError("Invalid request error on createUser"));
      } else if (err.message === "Enter a valid email") {
        next(new InvalidError("Invalid error on createUser"));
      } else if (err.message === "Email is already in use") {
        next(new ConflictError("Email already exists"));
      } else {
        next(err);
        // res
        //   .status(DEFAULT_ERROR)
        //   .send({ message: "An error has occurred on the server." });
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("User not found"));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      console.error(err);
      next(err);
      // if (err.name === "User not found") {
      //   res.status(NOTFOUND_ERROR).send({ message: err.message });
      // } else {
      //   res.status(DEFAULT_ERROR).send({ message: "Internal server error" });
      // }
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new InvalidError("Invalid credentials"));
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
        next(new UnauthorizedError("Invalid credentials"));
      } else {
        next(err);
        // res
        //   .status(DEFAULT_ERROR)
        //   .send({ message: "An error has occurred on the server." });
      }
    });
};

module.exports = { updateUser, getCurrentUser, createUser, loginUser };
