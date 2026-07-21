const express = require("express");
const router = express.Router();

const { register, login, getUsers, updateProfile } = require("../controllers/authController");
const { registerValidation, loginValidation, profileValidation } = require("../validators/authValidator");
const validate = require("../middleware/validate");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/users", authMiddleware, getUsers);
router.put("/profile", authMiddleware, upload.single("profileImage"), profileValidation, validate, updateProfile);

module.exports = router;
