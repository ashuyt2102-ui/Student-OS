require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const { connectDB, getDBStatus } = require("./config/db");
const socketHandler = require("./socket/socketHandler");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const examRoutes = require("./routes/examRoutes");
const syllabusRoutes = require("./routes/syllabusRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, "http://localhost:3000", "*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Pass io to Express app for use in controllers
app.set("io", io);

// Attach socket handlers
socketHandler(io);

// Core Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:3000", "*"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health & Status endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    database: getDBStatus(),
    version: "2.0.0 (RBAC Production Ready)",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect DB & Start Server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Atlas School Management API Server running on port ${PORT}`);
    console.log(`🔗 REST API:   http://localhost:${PORT}/api`);
    console.log(`⚡ Socket.IO:  http://localhost:${PORT}`);
    console.log(`🌐 Client URL: ${CLIENT_URL}`);
    console.log(`======================================================\n`);
  });
};

startServer();

module.exports = { app, server };
