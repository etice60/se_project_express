const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { handleAuthorization } = require("../middlewares/auth");
const { updateUserValidator } = require("../middlewares/validation");

// const { getUsers, getUser, createUser } = require("../controllers/users");

// router.get("/", getUsers);

// router.get("/:userId", getUser);

// router.post("/", createUser);

router.get("/me", handleAuthorization, getCurrentUser);
router.patch("/me", handleAuthorization, updateUserValidator, updateUser);

module.exports = router;
