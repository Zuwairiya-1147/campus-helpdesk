const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [ "Academic", "IT/Wi-Fi", "Infrastructure", "Faculty", "Other"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    remarks: {
      type: String,
      default: "",
    },
    photoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // adds createdAt, updatedAt automatically
);

module.exports = mongoose.model("Complaint", complaintSchema);
