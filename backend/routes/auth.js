const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const User = require("../models/User");
const {
  checkValidation,
  registerValidationRules,
  loginValidationRules,
} = require("../middleware/validate");

// Stricter limiter on auth routes specifically, to slow down credential-guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many attempts. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// POST /api/auth/register
router.post("/register", authLimiter, registerValidationRules, checkValidation, async (req, res, next) => {
  try {
    const { name, email, password, role, studentId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      studentId: role === "admin" ? undefined : studentId,
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, loginValidationRules, checkValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me -> return current user from token (handy for the frontend on page load)
const { protect } = require("../middleware/auth");
router.get("/me", protect, (req, res) => {
  const { _id, name, email, role, studentId } = req.user;
  res.json({ id: _id, name, email, role, studentId });
});

module.exports = router;
