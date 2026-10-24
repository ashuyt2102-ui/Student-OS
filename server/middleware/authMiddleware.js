const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "atlas_secret_jwt_key_2026_super_secure";

// Verify token and attach user to req
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account belonging to this token no longer exists.",
      });
    }

    // Teachers and Principals must be approved by the Principal
    if ((user.role === "teacher" || user.role === "principal") && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending administrator approval. Please contact the Principal.",
        isPendingApproval: true,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session token is invalid or has expired.",
    });
  }
};

// Role-Based Access Control (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
