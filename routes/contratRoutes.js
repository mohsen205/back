const express = require("express");
const router = express.Router();
const contratController = require("../Controllers/contrat.Controller");
const authenticateToken = require("../midelware/auth");

router.post(
  "/ajouterContrat",
  authenticateToken,
  contratController.createContrat
);

// Get PDFs by porteur
router.get(
  "/Pdfs",
  authenticateToken,
  contratController.getPdfContratsByPorteur
);

router.get(
  "/admin/contrats",
  authenticateToken,
  contratController.getAllPdfContracts
);

module.exports = router;
