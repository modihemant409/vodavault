const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const isAuth = require("../middleware/is-auth");

router.put("/edit-profile", isAuth, userController.editProfile);
router.get("/get-profile", isAuth, userController.getProfile);

module.exports = router;
