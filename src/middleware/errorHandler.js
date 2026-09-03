// Centralized error handler — keeps controllers free of repetitive try/catch boilerplate
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: "An account with this email already exists." });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
  });
}

// Wraps async route handlers so rejected promises reach errorHandler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
