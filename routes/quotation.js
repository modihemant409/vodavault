const express = require("express");
const router = express.Router();

const quotationController = require("../controller/quotationController");
const isAuth = require("../middleware/is-auth");

router.post("/add-quotation", isAuth, quotationController.addQuotation);
router.post(
  "/add-asset-with-insurance",
  isAuth,
  quotationController.addAssetWithInsurance
);
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
router.post("/add-valuation", isAuth, quotationController.addValuation);
router.get(
  "/remove-valuation/:valuationId",
  isAuth,
  quotationController.removeValuation
);
router.get("/get-valuation", isAuth, quotationController.getValuation);
router.get(
  "/get-assets-for-valuation",
  isAuth,
  quotationController.getAssetForValuation
);
module.exports = router;
