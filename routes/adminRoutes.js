const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/admin.Controller");
const authenticateToken = require("../midelware/auth");

// Get dashboard statistics
router.get(
  "/dashboard-stats",
  authenticateToken,
  adminController.getDashboardStats
);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
