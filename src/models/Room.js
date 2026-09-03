const mongoose = require("mongoose");

const AMENITIES = [
  "Whiteboard",
  "Projector",
  "Wi-Fi",
  "Power Outlets",
  "Quiet Zone",
  "Air Conditioning",
];

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    floor: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    hourlyRate: { type: Number, required: true, min: 0 },
    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((a) => AMENITIES.includes(a)),
        message: "Invalid amenity provided",
      },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roomSchema.index({ name: "text" });

module.exports = mongoose.model("Room", roomSchema);
module.exports.AMENITIES = AMENITIES;
