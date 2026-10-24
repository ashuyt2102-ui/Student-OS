const Attendance = require("../models/Attendance");
const User = require("../models/User");

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private (Students see only their own; Teachers/Principals see by class/student)
const getAttendance = async (req, res) => {
  const query = {};

  // Role restriction
  if (req.user.role === "student") {
    query.student = req.user._id;
  } else if (req.query.studentId) {
    query.student = req.query.studentId;
  }

  if (req.query.class) query.class = req.query.class;
  if (req.query.subject) query.subject = req.query.subject;

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  } else if (req.query.date) {
    const target = new Date(req.query.date);
    const startOfDay = new Date(target.setHours(0, 0, 0, 0));
    const endOfDay = new Date(target.setHours(23, 59, 59, 999));
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  const records = await Attendance.find(query)
    .populate("student", "name email studentId grade section avatar")
    .populate("markedBy", "name email role")
    .sort({ date: -1 });

  // Calculate statistics
  let present = 0;
  let late = 0;
  let absent = 0;

  records.forEach((r) => {
    if (r.status === "present") present++;
    else if (r.status === "late") late++;
    else if (r.status === "absent") absent++;
  });

  const total = present + late + absent;
  const rate = total === 0 ? "100.0" : (((present + late * 0.5) / total) * 100).toFixed(1);

  res.status(200).json({
    success: true,
    count: records.length,
    stats: {
      total,
      present,
      late,
      absent,
      rate,
    },
    records,
  });
};

// @desc    Batch mark attendance (Attendance Cycle feature)
// @route   POST /api/attendance
// @access  Teacher / Principal only
const markAttendanceBatch = async (req, res) => {
  const { date, class: className, subject, records } = req.body;

  if (!className || !records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide class and an array of student attendance records.",
    });
  }

  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const savedRecords = [];

  for (const item of records) {
    const studentId = item.studentId || item.student;
    const status = item.status; // 'present' | 'late' | 'absent'

    if (!studentId || !status) continue;

    // Upsert record for that student, day, and subject
    const record = await Attendance.findOneAndUpdate(
      {
        student: studentId,
        date: { $gte: startOfDay, $lte: endOfDay },
        subject: subject || "General",
      },
      {
        student: studentId,
        date: targetDate,
        status,
        class: className,
        subject: subject || "General",
        markedBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    savedRecords.push(record);
  }

  // Real-time Socket.IO emission
  const io = req.app.get("io");
  if (io) {
    io.emit("attendance_updated", {
      date: targetDate,
      class: className,
      subject,
      count: savedRecords.length,
      markedBy: req.user.name,
    });
  }

  res.status(201).json({
    success: true,
    message: `Attendance marked successfully for ${savedRecords.length} students on ${targetDate.toLocaleDateString()}.`,
    count: savedRecords.length,
    records: savedRecords,
  });
};

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Teacher / Principal only
const updateAttendanceRecord = async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, message: "Attendance record not found" });
  }

  if (req.body.status) record.status = req.body.status;
  if (req.body.date) record.date = new Date(req.body.date);
  if (req.body.subject) record.subject = req.body.subject;
  record.markedBy = req.user._id;

  const updated = await record.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("attendance_updated", {
      recordId: updated._id,
      studentId: updated.student,
      status: updated.status,
    });
  }

  res.status(200).json({ success: true, message: "Record updated", record: updated });
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Teacher / Principal only
const deleteAttendanceRecord = async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  await Attendance.findByIdAndDelete(req.params.id);

  const io = req.app.get("io");
  if (io) {
    io.emit("attendance_updated", { deletedId: req.params.id });
  }

  res.status(200).json({ success: true, message: "Attendance record deleted" });
};

module.exports = {
  getAttendance,
  markAttendanceBatch,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
