require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const validateEnv = require("./config/validateEnv");
const connectDB = require("./config/db");
const complaintRoutes = require("./routes/complaints");
const authRoutes = require("./routes/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Fail fast if required config is missing, instead of crashing deep in a request
validateEnv();

const app = express();

// --- Security middleware ---
app.use(helmet()); // sets safe HTTP headers (no sniffing, no clickjacking, etc.)
app.use(cors());
app.use(express.json({ limit: "10kb" })); // caps body size, mitigates payload-flood abuse
app.use(mongoSanitize()); // strips Mongo operators ($gt, $ne, etc.) from user input

// General rate limit across the whole API (auth routes have their own, stricter one)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// --- Database ---
connectDB();

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/", (req, res) => {
  res.send("Campus Help Desk API is running.");
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
