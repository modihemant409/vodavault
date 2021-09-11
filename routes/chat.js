const express = require("express");
const router = express.Router();

const chatController = require("../controller/chatController");
const isAuth = require("../middleware/is-auth");

router.post("/send-message", isAuth, chatController.sendMessage);
router.get("/get-message/:requestId", isAuth, chatController.getMessage);
router.get(
  "/get-message-by-id/:messageId",
  isAuth,
  chatController.getMessageById
);

module.exports = router;
