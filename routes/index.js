const router = require("express").Router();
const clothingItems = require("./clothingItems");

router.use("/items", clothingItems);

router.use((req, res) => {
  res.status(500).send({ message: "Router not found" });
});

module.exports = router;
