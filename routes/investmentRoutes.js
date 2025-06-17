const express = require("express");
const router = express.Router();
const investmentController = require("../Controllers/investment.Controller");
const authenticateToken = require("../midelware/auth");

// Get all investments for current user
router.get(
  "/mes-investissements",
  authenticateToken,
  investmentController.getMesInvestissements
);

// Get investment statistics
router.get(
  "/statistiques",
  authenticateToken,
  investmentController.getStatistiques
);

// Create new investment
router.post("/investir", authenticateToken, investmentController.investir);

// Cancel investment
router.post(
  "/:id/annuler",
  authenticateToken,
  investmentController.annulerInvestissement
);

// Get specific investment by ID (must be last of the GET routes)
router.get("/:id", authenticateToken, investmentController.getInvestmentById);

module.exports = router;
