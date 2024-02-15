const ClothingItem = require("../models/clothingItem");
// const clothingItems = require("../models/clothingItem");

const {
  INVALID_DATA_ERROR,
  NOTFOUND_ERROR,
  DEFAULT_ERROR,
  FORBIDDEN_ERROR,
} = require("../utils/errors");

const createItem = (req, res) => {
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
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid request error on createItem" });
      }
      return res
        .status(DEFAULT_ERROR)
        .send({ message: "Error from createItem" });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
      res.status(DEFAULT_ERROR).send({ message: "Error from getItems" });
    });
};

// const updateItem = (req, res) => {
//   const { itemId } = req.params;
//   const { imageUrl } = req.body;

//   ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
//     .orFail()
//     .then((item) => res.send({ data: item }))
//     .catch((err) => {
//       console.error(err);
//       console.log(err.name);
//       res.status(DEFAULT_ERROR).send({ message: "Error from updateItem" });
//     });
// };

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  console.log(itemId);
  const { _id: userId } = req.user;

  ClothingItem.findOne({ _id: itemId })
    .then((item) => {
      if (!item) {
        return Promise.reject(new Error("Id cannot be found"));
      }
      if (!item?.owner?.equals(userId)) {
        return Promise.reject(new Error("You are not the owner"));
      }
      return ClothingItem.deleteOne({ _id: itemId, owner: userId }).then(() => {
        res.send({ message: `Item ${itemId} Deleted` });
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Id cannot be found") {
        res
          .status(NOTFOUND_ERROR)
          .send({ message: `${err.name} Error on deleting item` });
      } else if (err.message === "You are not the owner") {
        res.status(FORBIDDEN_ERROR).send({ message: err.message });
      } else if (err.name === `CastError`) {
        res.status(INVALID_DATA_ERROR).send({ message: err.message });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Internal server error" });
      }
    });
};

const likeItem = (req, res) => {
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
        res
          .status(NOTFOUND_ERROR)
          .send({ message: `${err.name} error on likeItem` });
      } else if (err.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({
          message: "Invalid ID passed",
        });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "likeItem failed" });
      }
    });
};

const dislikeItem = (req, res) => {
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
        res
          .status(NOTFOUND_ERROR)
          .send({ message: `${err.name} error on dislikeItem` });
      } else if (err.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({
          message: "Invalid ID passed",
        });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "dislikeItem failed" });
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
