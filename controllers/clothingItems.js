const ClothingItem = require("../models/clothingItem");
const NotFoundError = require("../errors/notFoundError");
const InvalidError = require("../errors/invalidError");
const ForbiddenError = require("../errors/forbiddenError");
// const clothingItems = require("../models/clothingItem");

// const {
//   INVALID_DATA_ERROR,
//   NOTFOUND_ERROR,
//   DEFAULT_ERROR,
//   FORBIDDEN_ERROR,
// } = require("../utils/errors");

const createItem = (req, res, next) => {
  console.log(req.user._id);
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `ValidationError`) {
        next(INVALID_DATA_ERROR).send({
          message: "Invalid request error on createItem",
        });
      }
      next(err);
      // return res
      //   .status(DEFAULT_ERROR)
      //   .send({ message: "Error from createItem" });
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
      next(err);
      // res.status(DEFAULT_ERROR).send({ message: "Error from getItems" });
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  console.log(itemId);
  const { _id: userId } = req.user;

  ClothingItem.findOne({ _id: itemId })
    .then((item) => {
      if (!item) {
        return next(new NotFoundError("Id cannot be found"));
      }
      if (!item?.owner?.equals(userId)) {
        return next(new ForbiddenError("You are not the owner"));
      }
      return ClothingItem.deleteOne({ _id: itemId, owner: userId }).then(() => {
        res.send({ message: `Item ${itemId} Deleted` });
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
      // if (err.message === "Id cannot be found") {
      //   res
      //     .status(NOTFOUND_ERROR)
      //     .send({ message: `${err.name} Error on deleting item` });
      // } else if (err.message === "You are not the owner") {
      //   res.status(FORBIDDEN_ERROR).send({ message: err.message });
      // } else if (err.name === `CastError`) {
      //   res.status(INVALID_DATA_ERROR).send({ message: err.message });
      // } else {
      //   res.status(DEFAULT_ERROR).send({ message: "Internal server error" });
      // }
    });
};

const likeItem = (req, res, next) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      console.error(err.name);
      if (err.name === `DocumentNotFoundError`) {
        next(new NotFoundError(`${err.name} Error on likeItem`));
      } else if (err.name === "CastError") {
        next(new InvalidError("Invalid credentials, unable to remove like"));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  console.log(req.user._id);
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === `DocumentNotFoundError`) {
        next(new NotFoundError(`${err.name} error on dislikeItem`));
      } else if (err.name === "CastError") {
        next(new InvalidError("Invalid ID passed"));
      } else {
        next(err);
      }
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
