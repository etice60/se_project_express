const router = require("express").Router();
const clothingItems = require("./clothingItems");
const users = require("./users");
const { NOTFOUND_ERROR } = require("../utils/errors");

router.use("/items", clothingItems);
router.use("/users", users);

router.use((req, res) => {
  res.status(NOTFOUND_ERROR).send({ message: "Requested resource not found" });
});

module.exports = router;
