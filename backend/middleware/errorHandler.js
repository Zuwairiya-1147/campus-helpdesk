// Catches any route/path that doesn't exist
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Single place that formats every error response consistently.
// Route handlers can just call next(error) and let this take over.
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Something went wrong on the server.";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found.";
  }

  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : "Field"} already in use.`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
  }

  res.status(statusCode).json({
    message,
    // stack only in development, never expose internals in production
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
