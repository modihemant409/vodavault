const express = require("express");
const router  = express.Router();

const userController = require("../controller/userController");
const isAuth          = require("../middleware/is-auth");

router.put("/edit-profile", isAuth, userController.editProfile);
router.get("/get-profile", isAuth, userController.getProfile);
router.get("/remove-notification/:notificationId",isAuth,userController.removeNotification);
router.get("/get-notification", isAuth, userController.getNotification);
router.get("/add-country/:country", isAuth, userController.addCountry);
router.post("/make-user-premiume", isAuth,userController.makeUserPremiume);
router.post("/coupon-apply", isAuth, userController.ApplyCoupon);
router.get("/subscriptions-data", isAuth, userController.SubscriptionsData);
router.get("/subscriptions-details/:package_id", isAuth, userController.SubscriptionsDetails);
router.post("/subscriptions-buy", isAuth, userController.SubscriptionsBuy);
router.get("/my-subscriptions/:userId", isAuth, userController.My_Subscription);

module.exports = router;
