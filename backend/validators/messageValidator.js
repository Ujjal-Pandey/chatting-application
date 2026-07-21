const { body } = require("express-validator");

exports.messageValidation = [
  body("receiverId")
    .notEmpty().withMessage("Receiver ID is required")
    .isMongoId().withMessage("Receiver ID must be a valid MongoDB ObjectId"),

  body("message")
    .trim()
    .notEmpty().withMessage("Message cannot be empty")
    .isLength({ max: 500 }).withMessage("Message cannot exceed 500 characters")
];
