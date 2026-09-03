const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function cookieOptions() {
  // NOTE: the assignment spec asks for sameSite: "strict". That is used here for
  // same-site/local dev. If you deploy client and server on different domains
  // (e.g. Vercel + Render), "strict" will block the cookie cross-site — switch
  // this to "none" (with secure: true) in that case.
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

function setAuthCookie(res, userId) {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearAuthCookie(res) {
  const { maxAge, ...clearOpts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, clearOpts);
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, COOKIE_NAME };
