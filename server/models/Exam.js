const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required (e.g. Mathematics)"],
    },
    description: {
      type: String,
      default: "", // e.g. "Algebra & Calculus"
    },
    date: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    time: {
      type: String,
      default: "9:00 AM",
    },
    room: {
      type: String,
      default: "Room 204",
    },
    class: {
      type: String,
      default: "Grade 11 Science",
    },
    subject: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "normal"],
      default: "normal",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Exam || mongoose.model("Exam", examSchema);
