const Marks = require("../models/Marks");
const Notification = require("../models/Notification");

// @desc    Get marks
// @route   GET /api/marks
// @access  Private (Student sees own; Teacher/Principal sees all/filtered)
const getMarks = async (req, res) => {
  const query = {};

  if (req.user.role === "student") {
    query.student = req.user._id;
  } else if (req.query.studentId) {
    query.student = req.query.studentId;
  }

  if (req.query.subject) query.subject = req.query.subject;
  if (req.query.class) query.class = req.query.class;

  const marks = await Marks.find(query)
    .populate("student", "name email studentId grade section avatar")
    .populate("addedBy", "name email")
    .sort({ date: -1 });

  // Calculate average
  const totalScores = marks.reduce((acc, curr) => acc + curr.score, 0);
  const average = marks.length > 0 ? (totalScores / marks.length).toFixed(1) : "0.0";

  res.status(200).json({
    success: true,
    count: marks.length,
    average,
    marks,
  });
};

// @desc    Add marks for a student
// @route   POST /api/marks
// @access  Teacher / Principal only
const addMarks = async (req, res) => {
  const { student, subject, examType, score, maxScore, date, class: className } = req.body;

  if (!student || !subject || !examType || score === undefined) {
    return res.status(400).json({
      success: false,
      message: "Please provide student, subject, examType, and score.",
    });
  }

  const mark = await Marks.create({
    student,
    subject,
    examType,
    score: Number(score),
    maxScore: maxScore ? Number(maxScore) : 100,
    date: date ? new Date(date) : new Date(),
    class: className || "Grade 11 Science",
    addedBy: req.user._id,
  });

  const populated = await Marks.findById(mark._id).populate("student", "name email studentId");

  // Create notification for the student
  await Notification.create({
    recipient: student,
    message: `New score posted: ${subject} - ${examType} (${score}/${maxScore || 100})`,
    type: "marks",
    link: "/student/marks",
  });

  // Real-time Socket.IO emission
  const io = req.app.get("io");
  if (io) {
    io.emit("marks_updated", {
      studentId: student,
      subject,
      examType,
      score,
      mark: populated,
    });
  }

  res.status(201).json({
    success: true,
    message: `Marks recorded for ${populated.student ? populated.student.name : "student"}: ${score}/100`,
    mark: populated,
  });
};

// @desc    Update marks
// @route   PUT /api/marks/:id
// @access  Teacher / Principal only
const updateMarks = async (req, res) => {
  const mark = await Marks.findById(req.params.id);
  if (!mark) {
    return res.status(404).json({ success: false, message: "Mark record not found" });
  }

  const { score, maxScore, examType, subject, date } = req.body;
  if (score !== undefined) mark.score = Number(score);
  if (maxScore !== undefined) mark.maxScore = Number(maxScore);
  if (examType) mark.examType = examType;
  if (subject) mark.subject = subject;
  if (date) mark.date = new Date(date);

  const updated = await mark.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("marks_updated", {
      studentId: updated.student,
      updatedId: updated._id,
      score: updated.score,
    });
  }

  res.status(200).json({ success: true, message: "Mark record updated", mark: updated });
};

// @desc    Delete marks
// @route   DELETE /api/marks/:id
// @access  Teacher / Principal only
const deleteMarks = async (req, res) => {
  const mark = await Marks.findById(req.params.id);
  if (!mark) {
    return res.status(404).json({ success: false, message: "Mark record not found" });
  }

  await Marks.findByIdAndDelete(req.params.id);

  const io = req.app.get("io");
  if (io) {
    io.emit("marks_updated", { deletedId: req.params.id });
  }

  res.status(200).json({ success: true, message: "Mark record removed" });
};

module.exports = {
  getMarks,
  addMarks,
  updateMarks,
  deleteMarks,
};
