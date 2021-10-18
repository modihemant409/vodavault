const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const isAuth = require("../middleware/is-auth");

router.put("/edit-profile", isAuth, userController.editProfile);
router.get("/get-profile", isAuth, userController.getProfile);
router.get(
  "/remove-notification/:notificationId",
  isAuth,
  userController.removeNotification
);
router.get("/get-notification", isAuth, userController.getNotification);
router.get("/add-country/:country", isAuth, userController.addCountry);

module.exports = router;
