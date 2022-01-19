const express = require("express");
const router = express.Router();

const dashboardController = require("../controller/dashboardController");
const isAuth = require("../middleware/is-auth");

router.get("/get-dashboard", isAuth, dashboardController.getDashboard);

module.exports = router;
