const { body, validationResult } = require("express-validator");

// Runs after a set of validation rules; if any failed, returns a 400 with details
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const complaintValidationRules = [
  body("category")
    .notEmpty()
    .withMessage("Category is required.")
    .isIn(["Hostel", "Academic", "IT/Wi-Fi", "Infrastructure", "Faculty", "Other"])
    .withMessage("Category must be one of the allowed values."),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long."),
];

const registerValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("role")
    .optional()
    .isIn(["student", "admin"])
    .withMessage("Role must be either student or admin."),
  body("studentId")
    .if(body("role").equals("student"))
    .notEmpty()
    .withMessage("Student ID is required for student accounts."),
];

const loginValidationRules = [
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

module.exports = {
  checkValidation,
  complaintValidationRules,
  registerValidationRules,
  loginValidationRules,
};
