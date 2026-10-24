const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const syllabusSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    completedTopics: {
      type: Number,
      default: 0,
    },
    class: {
      type: String,
      default: "Grade 11 Science",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chapters: [chapterSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Syllabus || mongoose.model("Syllabus", syllabusSchema);
