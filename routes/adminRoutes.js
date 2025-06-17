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

module.exports = router;
