const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },
    class: {
      type: String,
      required: true,
      default: "Grade 11 Science",
    },
    subject: {
      type: String,
      default: "General",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to avoid duplicate attendance for the same student on the same date/subject
attendanceSchema.index({ student: 1, date: 1, subject: 1 });

module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
