require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");
const Exam = require("../models/Exam");
const Syllabus = require("../models/Syllabus");
const Notification = require("../models/Notification");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/atlas_school";

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("[Seed] Connected! Clearing existing data...");

    // Clear collections
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    await Exam.deleteMany({});
    await Syllabus.deleteMany({});
    await Notification.deleteMany({});

    console.log("[Seed] Populating users across Student, Teacher, and Principal roles...");

    // 1. Create Principal
    const principal = await User.create({
      name: "Dr. Arthur Vance",
      email: "principal@atlas.edu",
      password: "password123",
      role: "principal",
      grade: "Administration",
      section: "Executive",
      subject: "Administration",
      isApproved: true,
      avatar: "AV",
    });

    // 2. Create Teachers
    const mathTeacher = await User.create({
      name: "Dr. Evelyn Reed",
      email: "teacher@atlas.edu",
      password: "password123",
      role: "teacher",
      grade: "Grade 11",
      section: "Science",
      subject: "Mathematics",
      isApproved: true,
      avatar: "ER",
    });

    const physicsTeacher = await User.create({
      name: "Prof. Marcus Vance",
      email: "physics@atlas.edu",
      password: "password123",
      role: "teacher",
      grade: "Grade 11",
      section: "Science",
      subject: "Physics",
      isApproved: true,
      avatar: "MV",
    });

    // Pending teacher awaiting Principal approval
    const pendingTeacher = await User.create({
      name: "David Kim",
      email: "pending.teacher@atlas.edu",
      password: "password123",
      role: "teacher",
      grade: "Grade 11",
      section: "Humanities",
      subject: "History",
      isApproved: false, // requires principal approval
      avatar: "DK",
    });

    // 3. Create Students
    const studentAlex = await User.create({
      name: "Alex Sharma",
      email: "alex@atlas.edu",
      password: "password123",
      role: "student",
      grade: "Grade 11",
      section: "Science",
      studentId: "STU-101",
      isApproved: true,
      avatar: "AS",
    });

    const studentPriya = await User.create({
      name: "Priya Patel",
      email: "priya@atlas.edu",
      password: "password123",
      role: "student",
      grade: "Grade 11",
      section: "Science",
      studentId: "STU-102",
      isApproved: true,
      avatar: "PP",
    });

    const studentRohan = await User.create({
      name: "Rohan Verma",
      email: "rohan@atlas.edu",
      password: "password123",
      role: "student",
      grade: "Grade 11",
      section: "Science",
      studentId: "STU-103",
      isApproved: true,
      avatar: "RV",
    });

    const studentLiam = await User.create({
      name: "Liam Chen",
      email: "liam@atlas.edu",
      password: "password123",
      role: "student",
      grade: "Grade 11",
      section: "Science",
      studentId: "STU-104",
      isApproved: true,
      avatar: "LC",
    });

    console.log(`[Seed] Created ${await User.countDocuments()} users.`);

    // 4. Create Attendance Records for October 2026
    console.log("[Seed] Populating attendance records...");
    const sampleStudents = [studentAlex, studentPriya, studentRohan, studentLiam];
    const attendanceStatuses = ["present", "present", "present", "present", "present", "late", "absent"];

    for (let day = 1; day <= 23; day++) {
      // Skip weekends roughly
      const date = new Date(2026, 9, day, 9, 0, 0);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const student of sampleStudents) {
        // High presence probability for Alex (92.4%)
        let status = "present";
        if (student._id.equals(studentAlex._id)) {
          if (day === 3 || day === 16) status = "late";
          else if (day === 12) status = "absent";
        } else {
          status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];
        }

        await Attendance.create({
          student: student._id,
          date,
          status,
          class: "Grade 11 Science",
          subject: "Mathematics",
          markedBy: mathTeacher._id,
        });
      }
    }
    console.log(`[Seed] Created ${await Attendance.countDocuments()} attendance records.`);

    // 5. Create Marks
    console.log("[Seed] Populating marks assessments...");
    const marksData = [
      { student: studentAlex._id, subject: "Mathematics", examType: "Unit test 01", score: 85, date: new Date(2026, 8, 12) },
      { student: studentAlex._id, subject: "Physics", examType: "Chapter test 01", score: 83, date: new Date(2026, 8, 18) },
      { student: studentAlex._id, subject: "Chemistry", examType: "Unit test 01", score: 80, date: new Date(2026, 8, 24) },
      { student: studentAlex._id, subject: "Computer science", examType: "Practical 01", score: 94, date: new Date(2026, 8, 30) },
      { student: studentAlex._id, subject: "Mathematics", examType: "Unit test 02", score: 85, date: new Date(2026, 9, 5) },
      { student: studentAlex._id, subject: "Chemistry", examType: "Unit test 02", score: 78, date: new Date(2026, 9, 10) },
      { student: studentAlex._id, subject: "Physics", examType: "Chapter test 02", score: 86, date: new Date(2026, 9, 12) },
      { student: studentAlex._id, subject: "Mathematics", examType: "Unit test 03", score: 91, date: new Date(2026, 9, 15) },

      // Peer marks
      { student: studentPriya._id, subject: "Mathematics", examType: "Unit test 03", score: 88, date: new Date(2026, 9, 15) },
      { student: studentRohan._id, subject: "Mathematics", examType: "Unit test 03", score: 79, date: new Date(2026, 9, 15) },
      { student: studentLiam._id, subject: "Mathematics", examType: "Unit test 03", score: 95, date: new Date(2026, 9, 15) },
    ];

    for (const m of marksData) {
      await Marks.create({
        ...m,
        maxScore: 100,
        class: "Grade 11 Science",
        addedBy: mathTeacher._id,
      });
    }
    console.log(`[Seed] Created ${await Marks.countDocuments()} marks entries.`);

    // 6. Create Exams
    console.log("[Seed] Populating upcoming exams...");
    await Exam.create([
      {
        title: "Mathematics",
        description: "Algebra & Calculus · Room 204",
        date: new Date(2026, 9, 22, 9, 0, 0),
        time: "9:00 AM",
        room: "Room 204",
        class: "Grade 11 Science",
        subject: "Mathematics",
        priority: "high",
        createdBy: mathTeacher._id,
      },
      {
        title: "Physics",
        description: "Mechanics & Waves · Room 108",
        date: new Date(2026, 9, 25, 9, 0, 0),
        time: "9:00 AM",
        room: "Room 108",
        class: "Grade 11 Science",
        subject: "Physics",
        priority: "normal",
        createdBy: physicsTeacher._id,
      },
      {
        title: "Chemistry",
        description: "Organic chemistry · Lab 2",
        date: new Date(2026, 9, 28, 9, 0, 0),
        time: "9:00 AM",
        room: "Lab 2",
        class: "Grade 11 Science",
        subject: "Chemistry",
        priority: "normal",
        createdBy: mathTeacher._id,
      },
      {
        title: "Computer Science",
        description: "Python & Data Structures · Lab 1",
        date: new Date(2026, 10, 2, 11, 0, 0),
        time: "11:00 AM",
        room: "Lab 1",
        class: "Grade 11 Science",
        subject: "Computer Science",
        priority: "normal",
        createdBy: mathTeacher._id,
      },
    ]);
    console.log(`[Seed] Created ${await Exam.countDocuments()} scheduled exams.`);

    // 7. Create Syllabus
    console.log("[Seed] Populating syllabus curriculum...");
    await Syllabus.create([
      {
        subject: "Mathematics",
        topic: "Calculus & Linear Algebra",
        description: "Complete Grade 11 Science curriculum",
        class: "Grade 11 Science",
        progress: 78,
        totalTopics: 6,
        completedTopics: 4,
        teacher: mathTeacher._id,
        chapters: [
          { name: "Relations & Functions", done: true },
          { name: "Matrices & Determinants", done: true },
          { name: "Continuity & Differentiability", done: true },
          { name: "Integrals & Applications", done: true },
          { name: "Differential Equations", done: false },
          { name: "Vector Algebra", done: false },
        ],
      },
      {
        subject: "Physics",
        topic: "Electromagnetism & Waves",
        description: "Mechanics, Field equations & Modern Physics",
        class: "Grade 11 Science",
        progress: 65,
        totalTopics: 5,
        completedTopics: 3,
        teacher: physicsTeacher._id,
        chapters: [
          { name: "Electric Charges & Fields", done: true },
          { name: "Electrostatic Potential", done: true },
          { name: "Current Electricity", done: true },
          { name: "Moving Charges & Magnetism", done: false },
          { name: "Electromagnetic Induction", done: false },
        ],
      },
      {
        subject: "Chemistry",
        topic: "Physical & Organic Chemistry",
        description: "Solutions, Kinetics and Reaction Mechanisms",
        class: "Grade 11 Science",
        progress: 71,
        totalTopics: 6,
        completedTopics: 4,
        teacher: mathTeacher._id,
        chapters: [
          { name: "Solutions", done: true },
          { name: "Electrochemistry", done: true },
          { name: "Chemical Kinetics", done: true },
          { name: "Coordination Compounds", done: true },
          { name: "Haloalkanes & Haloarenes", done: false },
          { name: "Aldehydes & Ketones", done: false },
        ],
      },
      {
        subject: "Computer Science",
        topic: "Data Structures & Algorithms",
        description: "Python, File I/O, Stacks & Queues",
        class: "Grade 11 Science",
        progress: 82,
        totalTopics: 5,
        completedTopics: 4,
        teacher: mathTeacher._id,
        chapters: [
          { name: "Python Revision Tour", done: true },
          { name: "Functions & Recursion", done: true },
          { name: "Data File Handling", done: true },
          { name: "Data Structures (Stacks/Queues)", done: true },
          { name: "Computer Networks", done: false },
        ],
      },
      {
        subject: "English",
        topic: "Advanced Prose & Composition",
        description: "Literature, Formal writing and comprehension",
        class: "Grade 11 Science",
        progress: 54,
        totalTopics: 6,
        completedTopics: 3,
        teacher: mathTeacher._id,
        chapters: [
          { name: "Reading Comprehension & Note Making", done: true },
          { name: "Formal Letters & Notices", done: true },
          { name: "Prose: The Last Lesson", done: true },
          { name: "Poetry: Keeping Quiet", done: false },
          { name: "Supplementary: The Tiger King", done: false },
          { name: "Debate & Speech Writing", done: false },
        ],
      },
    ]);
    console.log(`[Seed] Created ${await Syllabus.countDocuments()} syllabus subjects.`);

    // 8. Create Notifications
    await Notification.create([
      {
        recipient: studentAlex._id,
        message: "Mathematics Exam scheduled for 22 Oct in Room 204 (9:00 AM)",
        type: "exam",
        link: "/student/exams",
      },
      {
        recipient: studentAlex._id,
        message: "Score published: Mathematics Unit test 03 (91/100)",
        type: "marks",
        link: "/student/marks",
      },
      {
        recipient: null,
        message: "Academic Year 2026–2027 Term 1 is 68% completed.",
        type: "general",
        link: "/student",
      },
      {
        recipient: principal._id,
        message: "Teacher account awaiting approval: David Kim (History)",
        type: "approval",
        link: "/principal/teachers",
      },
    ]);

    console.log(`\n======================================================`);
    console.log(`✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`======================================================`);
    console.log(`STUDENT ACCOUNT:   alex@atlas.edu       / password123`);
    console.log(`TEACHER ACCOUNT:   teacher@atlas.edu    / password123`);
    console.log(`PRINCIPAL ACCOUNT: principal@atlas.edu  / password123`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error("[Seed Error]", error);
    process.exit(1);
  }
};

seedDatabase();
