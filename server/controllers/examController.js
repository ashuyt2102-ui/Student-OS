const Exam = require("../models/Exam");
const Notification = require("../models/Notification");

// @desc    Get exams
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
  const query = {};
  if (req.query.class) query.class = req.query.class;
  if (req.query.subject) query.subject = req.query.subject;

  const exams = await Exam.find(query)
    .populate("createdBy", "name email role")
    .sort({ date: 1 });

  res.status(200).json({ success: true, count: exams.length, exams });
};

// @desc    Create exam
// @route   POST /api/exams
// @access  Teacher / Principal only
const createExam = async (req, res) => {
  const { title, description, date, time, room, class: className, subject, priority } = req.body;

  if (!title || !date || !subject) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, date, and subject for the exam.",
    });
  }

  const exam = await Exam.create({
    title,
    description: description || "",
    date: new Date(date),
    time: time || "9:00 AM",
    room: room || "Room 204",
    class: className || "Grade 11 Science",
    subject,
    priority: priority || "normal",
    createdBy: req.user._id,
  });

  // Broadcast notification to students
  await Notification.create({
    recipient: null, // school-wide
    message: `New assessment scheduled: ${title} on ${new Date(date).toLocaleDateString()} (${time || "9:00 AM"})`,
    type: "exam",
    link: "/student/exams",
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("exam_added", { exam });
  }

  res.status(201).json({
    success: true,
    message: `Exam scheduled successfully: ${title}`,
    exam,
  });
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Teacher / Principal only
const updateExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, message: "Exam not found" });
  }

  const { title, description, date, time, room, class: className, subject, priority } = req.body;
  if (title) exam.title = title;
  if (description !== undefined) exam.description = description;
  if (date) exam.date = new Date(date);
  if (time) exam.time = time;
  if (room) exam.room = room;
  if (className) exam.class = className;
  if (subject) exam.subject = subject;
  if (priority) exam.priority = priority;

  const updated = await exam.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("exam_added", { exam: updated });
  }

  res.status(200).json({ success: true, message: "Exam updated", exam: updated });
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Teacher / Principal only
const deleteExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res.status(404).json({ success: false, message: "Exam not found" });
  }

  await Exam.findByIdAndDelete(req.params.id);

  const io = req.app.get("io");
  if (io) {
    io.emit("exam_deleted", { deletedId: req.params.id });
  }

  res.status(200).json({ success: true, message: "Exam deleted" });
};

module.exports = {
  getExams,
  createExam,
  updateExam,
  deleteExam,
};
