const expess = require("express");
const router = expess.Router();

const authController = require("../controller/authController");
const isAuth = require("../middleware/is-auth");

router.post("/verifyemail", authController.verifyEmail);
router.post("/signup", authController.signup);
router.get("/verifyuser/:email", authController.verifyUser);
router.post("/login", authController.login);
router.post("/logout", isAuth, authController.logout);
router.post("/forgotpassword", authController.forgetPassword);
router.post("/checkotp", authController.checkOtp);
router.post("/changepassword", authController.changePassword);
router.post("/set-new-password", isAuth, authController.setNewPassword);

//This is for admin
router.get("/createpassword/:password", authController.createPassword);

module.exports = router;
