const Room = require("../models/Room");
const Booking = require("../models/Booking");

// GET /api/rooms  — supports ?search=&amenities=a,b&minRate=&maxRate=&floor=&latest=6
async function getRooms(req, res) {
  const { search, amenities, minRate, maxRate, floor, latest } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (amenities) {
    const list = amenities.split(",").filter(Boolean);
    if (list.length) query.amenities = { $in: list };
  }
  if (floor) {
    query.floor = floor;
  }
  if (minRate || maxRate) {
    query.hourlyRate = {};
    if (minRate) query.hourlyRate.$gte = Number(minRate);
    if (maxRate) query.hourlyRate.$lte = Number(maxRate);
  }

  let cursor = Room.find(query).populate("owner", "name email photoURL").sort({ createdAt: -1 });
  if (latest) {
    cursor = cursor.limit(Number(latest));
  }

  const rooms = await cursor;
  return res.status(200).json({ success: true, data: rooms });
}

async function getRoomById(req, res) {
  const room = await Room.findById(req.params.id).populate("owner", "name email photoURL");
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  return res.status(200).json({ success: true, data: room });
}

async function getMyRooms(req, res) {
  const rooms = await Room.find({ owner: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: rooms });
}

async function createRoom(req, res) {
  const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body;
  if (!name || !description || !image || !floor || !capacity || !hourlyRate) {
    return res.status(400).json({ success: false, message: "All room fields are required." });
  }

  const room = await Room.create({
    name,
    description,
    image,
    floor,
    capacity,
    hourlyRate,
    amenities: amenities || [],
    owner: req.user.id,
  });

  return res.status(201).json({ success: true, message: "Room added successfully", data: room });
}

async function updateRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  if (req.user.id !== room.owner.toString()) {
    return res.status(403).json({ success: false, message: "You do not own this room." });
  }

  const editable = ["name", "description", "image", "floor", "capacity", "hourlyRate", "amenities"];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) room[field] = req.body[field];
  });

  await room.save();
  return res.status(200).json({ success: true, message: "Room updated successfully", data: room });
}

async function deleteRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  if (req.user.id !== room.owner.toString()) {
    return res.status(403).json({ success: false, message: "You do not own this room." });
  }

  await Booking.deleteMany({ roomId: room._id });
  await room.deleteOne();

  return res.status(200).json({ success: true, message: "Room deleted successfully" });
}

module.exports = { getRooms, getRoomById, getMyRooms, createRoom, updateRoom, deleteRoom };
