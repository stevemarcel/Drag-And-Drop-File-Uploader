// adminRoutes.js
import express from "express";

const router = express.Router();

// Admin login
router.post("/login", (req, res) => {
  const { accessKey } = req.body;

  if (!accessKey) {
    return res.status(400).json({
      success: false,
      message: "Access key is required.",
    });
  }

  if (accessKey !== process.env.ADMIN_ACCESS_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid access key.",
    });
  }

  // Create authenticated admin session
  req.session.isAdmin = true;

  return res.status(200).json({
    success: true,
    message: "Authentication successful.",
  });
});

// Admin logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Unable to log out.",
      });
    }

    res.clearCookie("connect.sid");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
});

export default router;
