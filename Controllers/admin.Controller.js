const User = require("../models/User.model");
const { sendMail } = require("../utils/sendEmail");
const mongoose = require("mongoose");
const Projet = require("../models/Projet.model");
const Investment = require("../models/Investment.model");

const adminController = {};

// Suppression utilisateur + données associées
adminController.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await Avocat.findOneAndDelete({ utilisateur: userId });
    await Expert.findOneAndDelete({ utilisateur: userId });
    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ message: "Utilisateur et ses données associées supprimés" });
  } catch (error) {
    console.error("Erreur lors de la suppression", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};

// Activer / Désactiver un utilisateur
adminController.toggleUserActivation = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? "activé" : "désactivé";
    res.status(200).json({ message: `Utilisateur ${action} avec succès` });
  } catch (error) {
    console.error(
      "Erreur lors de la modification de l'état de l'utilisateur:",
      error
    );
    res.status(500).json({
      message:
        "Erreur serveur lors de la modification de l'état de l'utilisateur",
    });
  }
};

// Récupérer tous les utilisateurs avec leurs infos associées
adminController.getAllUsersWithInfo = async (req, res) => {
  try {
    const users = await User.find().exec();

    const detailedUsers = await Promise.all(
      users.map(async (user) => {
        let additionalInfo = null;

        const avocat = await Avocat.findOne({ utilisateur: user._id }).exec();
        if (avocat) {
          additionalInfo = {
            type: "Avocat",
            data: {
              adresse: avocat.adresse,
              referenceConvention: avocat.referenceConvention,
              dateDebutConvention: avocat.dateDebutConvention,
              dateFinConvention: avocat.dateFinConvention,
              region: avocat.region,
              honoraires: avocat.honoraires,
            },
          };
        }

        const expert = await Expert.findOne({ utilisateur: user._id }).exec();
        if (expert) {
          additionalInfo = {
            type: "Expert",
            data: {
              adresse: expert.adresse,
              dateExpertise: expert.dateExpertise,
              fraisExpertise: expert.fraisExpertise,
            },
          };
        }

        const demandeur = await Demandeur.findOne({
          utilisateur: user._id,
        }).exec();
        if (demandeur) {
          additionalInfo = {
            type: "Demandeur",
            data: {
              // Ajoute ici les champs spécifiques au demandeur s'il y en a
            },
          };
        }

        return {
          ...user.toObject(),
          additionalInfo: additionalInfo || null,
        };
      })
    );

    res.status(200).json(detailedUsers);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error,
    });
  }
};

// Envoyer un email à un utilisateur
adminController.sendEmailToUser = async (req, res) => {
  const { userId, subject, emailContent } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Envoi de l'email
    await sendMail(user.email, subject, emailContent, true); // isHtml = true

    res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'envoi de l'email" });
  }
};

// Get admin dashboard statistics
adminController.getDashboardStats = async (req, res) => {
  try {
    // Verify if user is admin
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Accès non autorisé. Réservé aux administrateurs." });
    }

    // Project Statistics
    const totalProjects = await Projet.countDocuments();
    const activeProjects = await Projet.countDocuments({ statut: "validé" });
    const completedProjects = await Projet.countDocuments({
      statut: "terminé",
    });
    const pendingProjects = await Projet.countDocuments({
      statut: "en_attente",
    });

    // Investment Statistics
    const investments = await Investment.find({ statut: { $ne: "annule" } });
    const totalInvestments = investments.length;
    const totalInvestmentAmount = investments.reduce(
      (sum, inv) => sum + inv.montant_investi,
      0
    );
    const activeInvestments = investments.filter(
      (inv) => inv.statut === "actif"
    ).length;

    // Calculate expected returns
    const totalExpectedReturn = investments.reduce(
      (sum, inv) => sum + (inv.rendement_attendu || 0),
      0
    );

    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInvestments = await Investment.aggregate([
      {
        $match: {
          date_investissement: { $gte: sixMonthsAgo },
          statut: { $ne: "annule" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date_investissement" },
            month: { $month: "$date_investissement" },
          },
          total: { $sum: "$montant_investi" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Project categories distribution
    const projectsByCategory = await Projet.aggregate([
      {
        $group: {
          _id: "$categorie",
          count: { $sum: 1 },
          totalMontantRequis: { $sum: "$montant_requis" },
          totalMontantCollecte: { $sum: "$montant_collecté" },
        },
      },
    ]);

    // Risk level distribution
    const projectsByRiskLevel = await Projet.aggregate([
      {
        $group: {
          _id: "$niveauRisque",
          count: { $sum: 1 },
          averageReturn: { $avg: "$expectedReturn" },
        },
      },
    ]);

    const stats = {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        pending: pendingProjects,
      },
      investments: {
        total: totalInvestments,
        active: activeInvestments,
        totalAmount: totalInvestmentAmount,
        expectedReturn: totalExpectedReturn,
      },
      monthlyStats: monthlyInvestments,
      categories: projectsByCategory,
      riskLevels: projectsByRiskLevel,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting admin statistics:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = adminController;
