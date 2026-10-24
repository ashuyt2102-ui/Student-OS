const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "atlas_secret_jwt_key_2026_super_secure";
const JWT_EXPIRES_IN = "7d";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const sendTokenResponse = (user, statusCode, res, message = "") => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade,
      section: user.section,
      subject: user.subject,
      studentId: user.studentId,
      isApproved: user.isApproved,
      avatar: user.avatar,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { name, email, password, role, grade, section, subject, studentId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
  }

  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }

  const assignedRole = role || "student";
  // Auto-approve students; teachers & principals require approval unless first principal
  const isFirstPrincipal = assignedRole === "principal" && (await User.countDocuments({ role: "principal" })) === 0;
  const isApproved = assignedRole === "student" || isFirstPrincipal;

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: assignedRole,
    grade: grade || "Grade 11",
    section: section || "Science",
    subject: subject || (assignedRole === "teacher" ? "Mathematics" : ""),
    studentId: studentId || (assignedRole === "student" ? `STU-${Math.floor(100 + Math.random() * 900)}` : ""),
    isApproved,
  });

  if (!isApproved) {
    return res.status(201).json({
      success: true,
      message: "Account created successfully. Since you registered as a Teacher/Staff, an administrator (Principal) must approve your account before you can log in.",
      isPendingApproval: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: false,
      },
    });
  }

  sendTokenResponse(user, 201, res, "Account registered successfully.");
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide an email and password." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  if ((user.role === "teacher" || user.role === "principal") && !user.isApproved) {
    return res.status(403).json({
      success: false,
      message: "Your account is pending administrator approval. Please contact the Principal.",
      isPendingApproval: true,
    });
  }

  sendTokenResponse(user, 200, res, `Welcome back, ${user.name}`);
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({ success: true, user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.name = req.body.name || user.name;
  if (req.body.grade) user.grade = req.body.grade;
  if (req.body.section) user.section = req.body.section;
  if (req.body.subject) user.subject = req.body.subject;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  sendTokenResponse(updatedUser, 200, res, "Profile updated successfully");
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
};
