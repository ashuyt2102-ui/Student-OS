const Notification = require("../models/Notification");

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ recipient: req.user._id }, { recipient: null }],
  })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = notifications.filter((n) => !n.read).length;

  res.status(200).json({
    success: true,
    unreadCount,
    count: notifications.length,
    notifications,
  });
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  if (req.params.id === "all") {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipient: null }] },
      { $set: { read: true } }
    );
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  }

  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({ success: true, notification });
};

// @desc    Create live notification (e.g. simulation or announcement)
// @route   POST /api/notifications
// @access  Teacher / Principal only
const createNotification = async (req, res) => {
  const { recipient, message, type, link } = req.body;

  const notif = await Notification.create({
    recipient: recipient || null,
    message: message || "System update",
    type: type || "general",
    link: link || "",
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("notification_new", notif);
  }

  res.status(201).json({ success: true, notification: notif });
};

module.exports = {
  getNotifications,
  markNotificationRead,
  createNotification,
};
