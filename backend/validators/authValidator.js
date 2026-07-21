const { body } = require("express-validator");

exports.registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),

  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Please enter a valid email address"),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
];

exports.loginValidation = [
  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Please enter a valid email address"),

  body("password")
    .notEmpty().withMessage("Password is required")
];

exports.profileValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
];
