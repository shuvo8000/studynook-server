const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

async function createBooking(req, res) {
  const { roomId, date, startTime, endTime, note } = req.body;

  if (!roomId || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: "Room, date, start time, and end time are required." });
  }

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  if (endMin <= startMin) {
    return res.status(400).json({ success: false, message: "End time must be after start time." });
  }
  if (endMin - startMin < 60) {
    return res.status(400).json({ success: false, message: "Minimum booking length is 1 hour." });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (date < todayStr) {
    return res.status(400).json({ success: false, message: "You cannot book a past date." });
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found." });
  }

  // Conflict detection: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
  // Implemented via string comparison on zero-padded "HH:MM" times, which sorts correctly lexicographically.
  const conflict = await Booking.findOne({
    roomId,
    date,
    status: "confirmed",
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  if (conflict) {
    return res.status(409).json({ success: false, message: "This room is already booked for the selected time." });
  }

  const totalCost = ((endMin - startMin) / 60) * room.hourlyRate;

  const booking = await Booking.create({
    userId: req.user.id,
    roomId,
    date,
    startTime,
    endTime,
    totalCost,
    note: note || "",
    status: "confirmed",
  });

  await Room.updateOne({ _id: roomId }, { $inc: { bookingCount: 1 } });
  await User.updateOne({ _id: req.user.id }, { $push: { bookings: booking._id } });

  return res.status(201).json({ success: true, message: "Room booked successfully!", data: booking });
}

async function getMyBookings(req, res) {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate("roomId", "name image floor hourlyRate")
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: bookings });
}

async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "You cannot cancel another user's booking." });
  }
  if (booking.status === "cancelled") {
    return res.status(400).json({ success: false, message: "Booking is already cancelled." });
  }

  booking.status = "cancelled";
  await booking.save();

  await User.updateOne({ _id: req.user.id }, { $pull: { bookings: booking._id } });
  await Room.updateOne({ _id: booking.roomId }, { $inc: { bookingCount: -1 } });

  return res.status(200).json({ success: true, message: "Booking cancelled" });
}

module.exports = { createBooking, getMyBookings, cancelBooking };
