const express = require("express");
const router = express.Router();

const assetController = require("../controller/assetController");
const isAuth = require("../middleware/is-auth");

router.get("/get-asset-list", isAuth, assetController.getAssetList);
router.get(
  "/get-asset-detail/:assetId",
  isAuth,
  assetController.getAssetDetail
);
router.get(
  "/get-asset-by-build_number/:build_number",
  isAuth,
  assetController.getAssetByBuild
);
router.post("/add-single-asset", isAuth, assetController.addSingleAsset);
router.post("/add-multiple-asset", isAuth, assetController.addMultipleAssets);
router.post("/change-asset-status", isAuth, assetController.changeAssetStatus);
router.put("/update-asset", isAuth, assetController.updateAsset);
router.delete("/delete-asset/:assetId", isAuth, assetController.deleteAsset);
router.delete(
  "/delete-attachment/:attachmentId",
  isAuth,
  assetController.deleteAssetAttachment
);
router.post("/add-attachment", isAuth, assetController.addAssetAttachment);

module.exports = router;
