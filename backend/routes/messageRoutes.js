const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { messageValidation } = require("../validators/messageValidator");
const validate = require("../middleware/validate");
const {
  getMessages,
  sendMessage
} = require("../controllers/messageController");

// GET all messages with a user
router.get("/:userId", authMiddleware, getMessages);

// SEND message
router.post("/send", authMiddleware, messageValidation, validate, sendMessage);

module.exports = router;
