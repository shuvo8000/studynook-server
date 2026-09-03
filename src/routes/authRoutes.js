const express = require("express");
const { register, login, googleAuth, logout, me } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/google", asyncHandler(googleAuth));
router.post("/logout", asyncHandler(logout));
router.get("/me", authMiddleware, asyncHandler(me));

module.exports = router;
