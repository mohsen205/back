const express = require("express");
const router = express.Router();
const projetController = require("../Controllers/projet.Controller");
const authenticateToken = require("../midelware/auth");

router.post("/ajouterProjet", authenticateToken, projetController.creerProjet);
router.put(
  "/modifierProjet/:id",
  authenticateToken,
  projetController.modifierProjet
);
router.delete(
  "/supprimerProjet/:id",
  authenticateToken,
  projetController.supprimerProjet
);
router.get(
  "/mes-projets",
  authenticateToken,
  projetController.getProjetsUtilisateur
);
router.get("/allProjets", authenticateToken, projetController.getAllProjets);
router.put("/:id/accepter", authenticateToken, projetController.accepterProjet);
router.put("/:id/refuser", authenticateToken, projetController.refuserProjet);
router.get("/stats", authenticateToken, projetController.getProjectStats);
router.get("/:id", authenticateToken, projetController.getProjetById);

module.exports = router;
