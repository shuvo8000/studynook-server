const express = require("express");
const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/", authMiddleware, asyncHandler(createBooking));
router.get("/my", authMiddleware, asyncHandler(getMyBookings));
router.patch("/:id/cancel", authMiddleware, asyncHandler(cancelBooking));

module.exports = router;
