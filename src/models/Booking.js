const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true }, // "HH:00"
    endTime: { type: String, required: true },
    totalCost: { type: Number, required: true },
    note: { type: String, default: "" },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);

bookingSchema.index({ roomId: 1, date: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
