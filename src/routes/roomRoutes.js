const express = require("express");
const {
  getRooms,
  getRoomById,
  getMyRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/", asyncHandler(getRooms));
router.get("/mine", authMiddleware, asyncHandler(getMyRooms));
router.get("/:id", asyncHandler(getRoomById));
router.post("/", authMiddleware, asyncHandler(createRoom));
router.put("/:id", authMiddleware, asyncHandler(updateRoom));
router.delete("/:id", authMiddleware, asyncHandler(deleteRoom));

module.exports = router;
