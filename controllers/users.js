const User = require("../models/user");
const {
  INVALID_DATA_ERROR,
  NOTFOUND_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");

const getUsers = (req, res) => {
  console.log("get users");
  User.find({})
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      res.status(DEFAULT_ERROR).send({ message: "Error from getUsers" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid request error on createUser" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error from createUser" });
      }
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        res.status(NOTFOUND_ERROR).send({ message: err.message });
      } else if (err.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({
          message: "Invalid ID passed.",
        });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error from getUser" });
      }
    });
};

module.exports = { getUsers, getUser, createUser };
