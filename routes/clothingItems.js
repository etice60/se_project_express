const router = require("express").Router();
const { handleAuthorization } = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const {
  createItemValidator,
  validateId,
} = require("../middlewares/validation");

console.log(handleAuthorization);
console.log(createItem);

router.post("/", handleAuthorization, createItemValidator, createItem);

router.get("/", getItems);

// router.put("/:itemId", updateItem);

router.delete("/:itemId", handleAuthorization, validateId, deleteItem);

router.put("/:itemId/likes", handleAuthorization, validateId, likeItem);

router.delete("/:itemId/likes", handleAuthorization, validateId, dislikeItem);

module.exports = router;
