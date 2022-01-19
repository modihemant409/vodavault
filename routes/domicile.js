const express = require("express");
const router = express.Router();

const domicileController = require("../controller/domicileController");
const isAuth = require("../middleware/is-auth");

router.post("/add-domicile", isAuth, domicileController.addDomicile);
router.get("/get-domicile-list", isAuth, domicileController.domicileList);
router.post(
  "/get-current-domicile",
  isAuth,
  domicileController.GetCurrentDomicile
);
router.get(
  "/get-domicile-detail/:domicileId",
  isAuth,
  domicileController.domicileDetail
);
router.put("/edit-domicile", isAuth, domicileController.editDomicile);
router.delete(
  "/delete-domicile/:domicileId",
  isAuth,
  domicileController.deleteDomicile
);

module.exports = router;
