const express = require("express");
const router = express.Router();

const quotationController = require("../controller/quotationController");
const isAuth = require("../middleware/is-auth");

router.post("/add-quotation", isAuth, quotationController.addQuotation);
router.get(
  "/get-pending-quotation",
  isAuth,
  quotationController.getPendingQuotation
);
router.get(
  "/get-insured-quotation",
  isAuth,
  quotationController.getInsuredQuotation
);
router.get(
  "/get-assets-for-quotation",
  isAuth,
  quotationController.getAssetForQuotation
);

module.exports = router;
