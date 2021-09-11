const express = require("express");
const router = express.Router();

const specialistController = require("../controller/specialistController");
const isAuth = require("../middleware/is-auth");
const isSpecialist = require("../middleware/isSpecialist");

router.get(
  "/get-specialist-dashboard",
  isAuth,
  isSpecialist,
  specialistController.getSpecialistDashboard
);
router.post("/add-request", isAuth, specialistController.addRequest);
router.get(
  "/request-again/:requestId",
  isAuth,
  specialistController.requestAgain
);
router.post("/cancel-request", isAuth, specialistController.cancelRequest);
router.get("/get-sent-request", isAuth, specialistController.getSentRequest);
router.get(
  "/get-all-jobs",
  isAuth,
  isSpecialist,
  specialistController.getAllJobs
);

router.get(
  "/get-job-detail/:requestId",
  isAuth,
  isSpecialist,
  specialistController.getJobDetail
);
router.get(
  "/get-all-cancelled_jobs",
  isAuth,
  isSpecialist,
  specialistController.getAllCancelledJobs
);
router.post(
  "/add-assets-specialist",
  isAuth,
  isSpecialist,
  specialistController.addAssetBySpecialist
);
router.post("/confirm-assets", isAuth, specialistController.confirmAssets);
router.post(
  "/mark-job-completed/:requestId",
  isAuth,
  isSpecialist,
  specialistController.markJobAsCompleted
);
router.get(
  "/get-my-customers",
  isAuth,
  isSpecialist,
  specialistController.getMyCustomer
);
router.get(
  "/get-job-of-customers/:customerId",
  isAuth,
  isSpecialist,
  specialistController.getJobOfCustomer
);
module.exports = router;
