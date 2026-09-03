require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

const rooms = [
  {
    name: "Quiet Corner 301",
    description:
      "A sunlit corner room on the third floor, ideal for solo deep-focus sessions. Insulated walls keep it library-quiet even during peak hours.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
    floor: "3rd Floor",
    capacity: 2,
    hourlyRate: 4,
    amenities: ["Wi-Fi", "Quiet Zone", "Power Outlets"],
  },
  {
    name: "Focus Pod A",
    description:
      "A compact single-occupant pod designed for short, high-intensity study sprints between classes.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    floor: "1st Floor",
    capacity: 1,
    hourlyRate: 3,
    amenities: ["Wi-Fi", "Power Outlets"],
  },
  {
    name: "North Wing Study Room",
    description:
      "Spacious group room in the North Wing with a large whiteboard wall, great for exam prep sessions with classmates.",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800",
    floor: "2nd Floor",
    capacity: 6,
    hourlyRate: 8,
    amenities: ["Whiteboard", "Wi-Fi", "Air Conditioning", "Power Outlets"],
  },
  {
    name: "Research Room 204",
    description:
      "Reserved for focused research work, this room includes a projector for reviewing papers, slides, or datasets as a team.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    floor: "2nd Floor",
    capacity: 4,
    hourlyRate: 7,
    amenities: ["Projector", "Wi-Fi", "Quiet Zone"],
  },
  {
    name: "Maple Discussion Room",
    description:
      "A warm, wood-toned discussion room with movable seating — well suited to case-study breakdowns and group presentations.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
    floor: "1st Floor",
    capacity: 5,
    hourlyRate: 6,
    amenities: ["Whiteboard", "Wi-Fi", "Air Conditioning"],
  },
  {
    name: "Silent Zone 3B",
    description:
      "Part of the library's strict silent-study wing. No group bookings — built for uninterrupted reading and writing.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800",
    floor: "3rd Floor",
    capacity: 1,
    hourlyRate: 3,
    amenities: ["Quiet Zone", "Power Outlets"],
  },
  {
    name: "Graduate Study Suite",
    description:
      "A premium suite reserved for extended thesis and dissertation work, with ergonomic seating and consistent climate control.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
    floor: "4th Floor",
    capacity: 3,
    hourlyRate: 9,
    amenities: ["Wi-Fi", "Air Conditioning", "Power Outlets", "Quiet Zone"],
  },
  {
    name: "Innovation Study Hub",
    description:
      "An open, collaborative hub for project teams, equipped with a projector wall for pitch rehearsals and sprint planning.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    floor: "1st Floor",
    capacity: 8,
    hourlyRate: 10,
    amenities: ["Projector", "Whiteboard", "Wi-Fi", "Air Conditioning"],
  },
  {
    name: "East Reading Alcove",
    description:
      "A small alcove tucked beside the periodicals section, popular for quiet afternoon reading and light note-taking.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
    floor: "2nd Floor",
    capacity: 2,
    hourlyRate: 4,
    amenities: ["Quiet Zone", "Wi-Fi"],
  },
  {
    name: "Archive Wing Study Room",
    description:
      "Located near the archive collection, this room suits students cross-referencing physical materials with digital notes.",
    image: "https://images.unsplash.com/photo-1580983230786-4c2a2b1e4e8c?w=800",
    floor: "4th Floor",
    capacity: 3,
    hourlyRate: 5,
    amenities: ["Wi-Fi", "Power Outlets", "Quiet Zone"],
  },
];

async function seed() {
  await connectDB();

  console.log("Clearing existing rooms, bookings, and demo user...");
  await Booking.deleteMany({});
  await Room.deleteMany({});
  await User.deleteMany({ email: "demo@studynook.com" });

  const hashed = await bcrypt.hash("Demo123!", 10);
  const demoUser = await User.create({
    name: "Demo Student",
    email: "demo@studynook.com",
    password: hashed,
    provider: "local",
    photoURL: "https://i.pravatar.cc/150?u=demo",
  });

  const created = await Room.insertMany(
    rooms.map((r) => ({ ...r, owner: demoUser._id }))
  );

  console.log(`Seeded ${created.length} rooms and 1 demo user.`);
  console.log("Demo login -> email: demo@studynook.com | password: Demo123!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
