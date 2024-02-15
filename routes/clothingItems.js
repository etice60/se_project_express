const router = require("express").Router();
const { handleAuthorization } = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

console.log(handleAuthorization);
console.log(createItem);

router.post("/", handleAuthorization, createItem);

router.get("/", getItems);

// router.put("/:itemId", updateItem);

router.delete("/:itemId", handleAuthorization, deleteItem);

router.put("/:itemId/likes", handleAuthorization, likeItem);

router.delete("/:itemId/likes", handleAuthorization, dislikeItem);

module.exports = router;
