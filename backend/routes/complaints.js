const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const { protect, authorize } = require("../middleware/auth");
const { complaintValidationRules, checkValidation } = require("../middleware/validate");

// Helper: generate a readable complaint ID like CHD-2026-0001
const generateComplaintId = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const nextNumber = String(count + 1).padStart(4, "0");
  return `CHD-${year}-${nextNumber}`;
};

// POST /api/complaints -> logged-in student submits a new complaint
// Student identity comes from the verified token (req.user), never from the
// request body — otherwise a student could file a complaint under someone
// else's name/ID.
router.post(
  "/",
  protect,
  authorize("student"),
  complaintValidationRules,
  checkValidation,
  async (req, res, next) => {
    try {
      const { category, description, photoUrl } = req.body;
      const complaintId = await generateComplaintId();

      const complaint = await Complaint.create({
        complaintId,
        studentId: req.user.studentId,
        studentName: req.user.name,
        category,
        description,
        photoUrl,
      });

      res.status(201).json(complaint);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/complaints -> admin only: list all complaints (supports filtering)
// e.g. /api/complaints?status=Pending&category=Hostel
router.get("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { status, category, studentId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (studentId) filter.studentId = studentId;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
});

// GET /api/complaints/mine -> logged-in student: their own complaint history
router.get("/mine", protect, authorize("student"), async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user.studentId }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
});

// GET /api/complaints/stats/summary -> admin only: basic analytics
// NOTE: this must be defined BEFORE /:complaintId, otherwise Express matches
// "stats" as a complaintId value and this route never gets hit.
router.get("/stats/summary", protect, authorize("admin"), async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({ total, byStatus, byCategory });
  } catch (error) {
    next(error);
  }
});

// GET /api/complaints/:complaintId -> track a single complaint by its ID.
// Deliberately left public/unauthenticated, same as a courier tracking number:
// knowing the exact ID is the access control. This lets students check status
// without needing to be logged in on every device. Admin-only bulk listing
// above is what's actually protected.
router.get("/:complaintId", async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }
    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/complaints/:complaintId -> admin only: update status/remarks
router.patch("/:complaintId", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (status && !["Pending", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (status) complaint.status = status;
    if (remarks !== undefined) complaint.remarks = remarks;

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
