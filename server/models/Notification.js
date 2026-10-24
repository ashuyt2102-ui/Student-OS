const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means school-wide / broadcast
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["attendance", "marks", "exam", "syllabus", "approval", "general"],
      default: "general",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
