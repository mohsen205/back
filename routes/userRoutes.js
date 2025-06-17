const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.Controller");
const authenticateToken = require("../midelware/auth");
const upload = require("../midelware/multer");

// Get all users
router.get("/all-users", authenticateToken, userController.getAllUsers);

// Create new user (admin only)
router.post(
  "/add-user",
  authenticateToken,
  upload.single("imageprofile"),
  userController.createUser
);

// Get user by ID
router.get("/:id", authenticateToken, userController.getUserById);

// Get user profile
router.get("/profile", authenticateToken, userController.getUserProfile);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  upload.single("imageprofile"),
  userController.updateUserProfile
);

// Update user by ID (admin)
router.put("/:id", authenticateToken, userController.updateUser);

router.get("/porteur", authenticateToken, userController.getAllPorteurs);

module.exports = router;
