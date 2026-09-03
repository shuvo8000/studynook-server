const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { setAuthCookie, clearAuthCookie } = require("../utils/token");

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

async function register(req, res) {
  const { name, email, photoURL, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." });
  }
  if (!PASSWORD_RULES.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters and include an uppercase and a lowercase letter.",
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    photoURL: photoURL || "",
    password: hashed,
    provider: "local",
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful! Please login.",
    data: { id: user._id, name: user.name, email: user.email },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !user.password) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  setAuthCookie(res, user._id.toString());
  return res.status(200).json({ success: true, message: "Login successful", data: user.toJSON() });
}

// Google sign-in: client (Firebase Auth) verifies identity and sends us the
// resulting profile; we sync/create the local user record and issue our own JWT.
// For production hardening, verify the Firebase ID token server-side with
// firebase-admin before trusting req.body here.
async function googleAuth(req, res) {
  const { name, email, photoURL } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Google account email is required." });
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: name || "StudyNook User",
      email: email.toLowerCase(),
      photoURL: photoURL || "",
      provider: "google",
    });
  }

  setAuthCookie(res, user._id.toString());
  return res.status(200).json({ success: true, message: "Login successful", data: user.toJSON() });
}

async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: "Logged out" });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return res.status(200).json({ success: true, data: user.toJSON() });
}

module.exports = { register, login, googleAuth, logout, me };
