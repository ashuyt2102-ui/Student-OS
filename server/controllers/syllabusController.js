const Syllabus = require("../models/Syllabus");

// @desc    Get syllabus by subject / class
// @route   GET /api/syllabus
// @access  Private
const getSyllabus = async (req, res) => {
  const query = {};
  if (req.query.subject) query.subject = req.query.subject;
  if (req.query.class) query.class = req.query.class;

  const list = await Syllabus.find(query).populate("teacher", "name email").sort({ subject: 1 });

  // Compute overall percentage
  let totalTopicsCount = 0;
  let completedTopicsCount = 0;

  list.forEach((s) => {
    totalTopicsCount += s.totalTopics || (s.chapters ? s.chapters.length : 0);
    completedTopicsCount += s.completedTopics || (s.chapters ? s.chapters.filter((c) => c.done).length : 0);
  });

  const overallProgress =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 68;

  res.status(200).json({
    success: true,
    count: list.length,
    overallProgress,
    syllabus: list,
  });
};

// @desc    Create syllabus subject/topic
// @route   POST /api/syllabus
// @access  Teacher / Principal only
const createSyllabusTopic = async (req, res) => {
  const { subject, topic, description, class: className, chapters } = req.body;

  if (!subject) {
    return res.status(400).json({ success: false, message: "Subject is required" });
  }

  const chList = chapters || [];
  const total = chList.length;
  const done = chList.filter((c) => c.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const item = await Syllabus.create({
    subject,
    topic: topic || `${subject} Core Curriculum`,
    description: description || "",
    class: className || "Grade 11 Science",
    chapters: chList,
    totalTopics: total,
    completedTopics: done,
    progress,
    teacher: req.user._id,
    lastUpdated: new Date(),
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("syllabus_updated", { item });
  }

  res.status(201).json({ success: true, message: "Syllabus topic created", item });
};

// @desc    Update syllabus topic or toggle chapter
// @route   PUT /api/syllabus/:id
// @access  Teacher / Principal only
const updateSyllabusTopic = async (req, res) => {
  const item = await Syllabus.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Syllabus topic not found" });
  }

  const { chapters, topic, description, progress } = req.body;

  if (topic) item.topic = topic;
  if (description !== undefined) item.description = description;

  if (chapters && Array.isArray(chapters)) {
    item.chapters = chapters;
    item.totalTopics = chapters.length;
    item.completedTopics = chapters.filter((c) => c.done).length;
    item.progress = item.totalTopics > 0 ? Math.round((item.completedTopics / item.totalTopics) * 100) : 0;
  } else if (progress !== undefined) {
    item.progress = Number(progress);
  }

  item.lastUpdated = new Date();
  const updated = await item.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("syllabus_updated", { item: updated });
  }

  res.status(200).json({ success: true, message: "Syllabus progress updated", item: updated });
};

// @desc    Delete syllabus topic
// @route   DELETE /api/syllabus/:id
// @access  Teacher / Principal only
const deleteSyllabusTopic = async (req, res) => {
  const item = await Syllabus.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Topic not found" });
  }

  await Syllabus.findByIdAndDelete(req.params.id);

  const io = req.app.get("io");
  if (io) {
    io.emit("syllabus_updated", { deletedId: req.params.id });
  }

  res.status(200).json({ success: true, message: "Topic removed" });
};

module.exports = {
  getSyllabus,
  createSyllabusTopic,
  updateSyllabusTopic,
  deleteSyllabusTopic,
};
