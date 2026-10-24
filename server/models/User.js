const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["student", "teacher", "principal"],
      default: "student",
      required: true,
    },
    grade: {
      type: String,
      default: "Grade 11",
    },
    section: {
      type: String,
      default: "Science",
    },
    subject: {
      type: String,
      default: "", // for teachers, e.g., "Mathematics"
    },
    studentId: {
      type: String,
      default: function () {
        return this.role === "student" ? `STU-${Math.floor(100 + Math.random() * 900)}` : "";
      },
    },
    isApproved: {
      type: Boolean,
      default: function () {
        // Students are auto-approved. Teachers and Principals require principal approval.
        return this.role === "student";
      },
    },
    avatar: {
      type: String,
      default: function () {
        if (!this.name) return "AT";
        const parts = this.name.trim().split(/\s+/);
        return parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : this.name.slice(0, 2).toUpperCase();
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
