const Investment = require("../models/Investment.model");
const Projet = require("../models/Projet.model");
const User = require("../models/User.model");

const investmentController = {};

// Get all investments for the current investor
investmentController.getMesInvestissements = async (req, res) => {
  try {
    const investisseurId = req.user.userId;

    const investments = await Investment.find({ investisseur: investisseurId })
      .populate("projet")
      .populate("investisseur", "nom prenom");

    res.status(200).json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des investissements",
      error: error.message,
    });
  }
};

// Get specific investment by ID
investmentController.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate("projet")
      .populate("investisseur", "nom prenom");

    if (!investment) {
      return res.status(404).json({ message: "Investissement non trouvé" });
    }

    // Verify if the current user is the investor
    if (investment.investisseur._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    res.status(200).json(investment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'investissement",
      error: error.message,
    });
  }
};

// Create new investment
investmentController.investir = async (req, res) => {
  try {
    const { projet: projetId, montant_investi } = req.body;
    const investisseurId = req.user.userId;

    // Verify project exists
    const projet = await Projet.findById(projetId);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    // Verify project is open for investment
    if (projet.statut !== "validé") {
      return res
        .status(400)
        .json({ message: "Ce projet n'est pas ouvert aux investissements" });
    }

    // Calculate expected return based on project's expectedReturn
    const rendement_attendu = (montant_investi * projet.expectedReturn) / 100;

    // Calculate return date based on project end date
    const date_retour_attendu = projet.date_fin;

    const newInvestment = new Investment({
      projet: projetId,
      investisseur: investisseurId,
      montant_investi,
      rendement_attendu,
      date_retour_attendu,
      historique_paiements: [
        {
          date: new Date(),
          montant: montant_investi,
          type: "investissement",
          statut: "complete",
        },
      ],
    });

    await newInvestment.save();

    // Update project's collected amount
    projet.montant_collecté += montant_investi;
    await projet.save();

    res.status(201).json(newInvestment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création de l'investissement",
      error: error.message,
    });
  }
};

// Cancel investment
investmentController.annulerInvestissement = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Investissement non trouvé" });
    }

    // Verify if the current user is the investor
    if (investment.investisseur.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Only active investments can be cancelled
    if (investment.statut !== "actif") {
      return res
        .status(400)
        .json({ message: "Cet investissement ne peut pas être annulé" });
    }

    investment.statut = "annule";
    await investment.save();

    // Update project's collected amount
    const projet = await Projet.findById(investment.projet);
    if (projet) {
      projet.montant_collecté -= investment.montant_investi;
      await projet.save();
    }

    res.status(200).json(investment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'annulation de l'investissement",
      error: error.message,
    });
  }
};

// Get investment statistics
investmentController.getStatistiques = async (req, res) => {
  try {
    const investisseurId = req.user.userId;

    const investments = await Investment.find({
      investisseur: investisseurId,
      statut: { $ne: "annule" },
    });

    console.log(investments);

    const stats = {
      total_investi:
        investments.reduce((sum, inv) => sum + inv.montant_investi, 0) || 0,
      nombre_investissements: investments.length || 0,
      rendement_total:
        investments.reduce(
          (sum, inv) => sum + (inv.rendement_attendu || 0),
          0
        ) || 0,
      investissements_actifs:
        investments.filter((inv) => inv.statut === "actif").length || 0,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

module.exports = investmentController;
