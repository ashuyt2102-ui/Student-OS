const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    examType: {
      type: String,
      required: [true, "Exam type is required (e.g. Unit test 03)"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
      max: 100,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    class: {
      type: String,
      default: "Grade 11 Science",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Marks || mongoose.model("Marks", marksSchema);
