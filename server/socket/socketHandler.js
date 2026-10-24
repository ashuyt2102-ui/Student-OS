const socketHandler = (io) => {
  let connectedUsers = new Map(); // socketId -> { userId, role, name }

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] New connection established: ${socket.id}`);

    // Client registers role & user
    socket.on("register_user", ({ userId, role, name }) => {
      connectedUsers.set(socket.id, { userId, role, name });

      if (userId) socket.join(`user:${userId}`);
      if (role) socket.join(`room:${role}`);

      console.log(`[Socket.IO] User ${name || userId} joined as ${role} (Socket: ${socket.id})`);

      // Broadcast active user count
      io.emit("active_users_count", { count: io.engine.clientsCount });
    });

    // Real-time event relays
    socket.on("attendance_mark", (data) => {
      // Broadcast to all clients viewing attendance
      socket.broadcast.emit("attendance_updated", data);
    });

    socket.on("marks_add", (data) => {
      socket.broadcast.emit("marks_updated", data);
      if (data.studentId) {
        io.to(`user:${data.studentId}`).emit("personal_marks_updated", data);
      }
    });

    socket.on("exam_create", (data) => {
      socket.broadcast.emit("exam_added", data);
    });

    socket.on("syllabus_change", (data) => {
      socket.broadcast.emit("syllabus_updated", data);
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      io.emit("active_users_count", { count: io.engine.clientsCount });
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
