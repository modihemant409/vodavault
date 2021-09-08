const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const isAuth = require("../middleware/is-auth");
const isSignedIn = require("../middleware/isSignedIn");

router.post("/addprofile", isAuth, userController.addProfile);
router.get("/getprofile", isAuth, userController.getProfile);
router.get("/getprofile/:user_id", userController.getProfileId);
router.get("/allcourses", isSignedIn, userController.getAllCourse);
router.get("/coursedetail/:course_id", isSignedIn, userController.courseDetail);
router.get("/getcart", isAuth, userController.getCart);
router.get("/getcartcount", isAuth, userController.getCartCount);
router.post("/addtocart", isAuth, userController.addToCart);
router.post("/removecartitem", isAuth, userController.removeCartItem);
router.get("/mycourses", isAuth, userController.myCourses);
router.post("/addtowishlist", isAuth, userController.addToWishlist);
//router.post("/removewishlistitem", isAuth, userController.removeWishlistItem);
router.get("/getwishlist", isAuth, userController.getWishlist);
router.post("/addrating", isAuth, userController.addRating);
router.get("/coursepurchased_incart", isAuth, userController.checkMyCourses);

router.get("/checkout/:course_id", isAuth, userController.orderCourse);
router.get("/checkout/", isAuth, userController.checkoutCart);

router.get("/watchcourse/:course_id", isAuth, userController.watchCourse);
router.get("/playvideo/:lectureId", userController.playVideo);
router.post("/addcourseprogress", isAuth, userController.addProgress);
router.get("/getcourseprogress/:course_id", isAuth, userController.getProgress);

//Q&A
router.post("/addcomment", isAuth, userController.addComment);
router.get("/getcomment/:course_id", isAuth, userController.getComment);
router.post("/addcommentvotes", isAuth, userController.addCommentVotes);
router.get("/getallreviews/:course_id", userController.getAllReviews);

//live
router.get("/getlives", userController.getLive);

//evaluation form
router.post("/submitevaluation", isAuth, userController.addEvaluationForm);

//messages
router.get("/getmessagebyUsers", isAuth, userController.getMessageFroms);
router.get("/getmessage/:roomname", isAuth, userController.getMessages);
router.get("/checkformessage/:id", isAuth, userController.checkFormsg);

//certificate
router.get("/downloadcertificate", isAuth, userController.downloadCertificate);
router.get("/getmycertificate", isAuth, userController.getMyCertificate);
router.get("/getdiplomas", isSignedIn, userController.getAllDiplomas);
// router.get(
//   "/requestadmincertificate/:certificate_id",
//   isAuth,
//   userController.requestAdminCertificate
// );
router.get(
  "/getdiplomaquestion/:diploma_id",
  isAuth,
  userController.getDiplomaQuestions
);
router.post("/add-diploma-answer", isAuth, userController.addAnswer);
router.get("/seeresult/:diploma_id", isAuth, userController.seeResult);
router.get(
  "/start-diploma-exam/:diploma_id",
  isAuth,
  userController.startDiplomaExam
);
router.get(
  "/apply-for-diploma/:diploma_id",
  isAuth,
  userController.applyForDiploma
);
router.get(
  "/get-all-attempts/:diploma_id",
  isAuth,
  userController.getAllAttempts
);
router.get(
  "/get-resume-question/:diploma_id",
  isAuth,
  userController.getResumeQuestions
);
router.get("/get-diploma-for-courses", userController.getDiplomaForCourses);
router.get(
  "/diploma-leader-board/:diploma_id",
  userController.getDiplomaLeaderBoard
);

//Securevault Api Route
router.post("/detectObject", userController.detectObject);

module.exports = router;
