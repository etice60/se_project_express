const router = require("express").Router();
const clothingItems = require("./clothingItems");
const users = require("./users");
// const { NOTFOUND_ERROR } = require("../utils/errors");
const { loginUser, createUser } = require("../controllers/users");
const NotFoundError = require("../errors/NotFoundError");
const {
  loginUserValidator,
  createUserValidator,
} = require("../middlewares/validation");

router.use("/items", clothingItems);
router.use("/users", users);

router.post("/signin", loginUserValidator, loginUser);
router.post("/signup", createUserValidator, createUser);

router.use((req, res) => {
  next(new NotFoundError("Route not found"));
});

module.exports = router;
