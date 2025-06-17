const Projet = require("../models/Projet.model");
const User = require("../models/User.model");

const projetController = {};

projetController.creerProjet = async (req, res) => {
  try {
    const porteurId = req.user.userId;

    const utilisateur = await User.findById(porteurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const {
      numProjet,
      titre,
      description,
      categorie,
      montant_requis,
      date_debut,
      date_fin,
      niveauRisque,
      expectedReturn,
    } = req.body;

    const nouveauProjet = new Projet({
      numProjet,
      titre,
      description,
      categorie,
      montant_requis,
      date_debut,
      date_fin,
      niveauRisque,
      expectedReturn,
      porteur: porteurId,
    });

    await nouveauProjet.save();
    res.status(201).json(nouveauProjet);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création du projet.",
      error: error.message || error,
    });
  }
};

projetController.modifierProjet = async (req, res) => {
  try {
    const porteurId = req.user.userId;
    const projetId = req.params.id;

    const projetExist = await Projet.findById(projetId);
    if (!projetExist) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    if (projetExist.porteur.toString() !== porteurId) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce projet." });
    }

    const {
      titre,
      description,
      categorie,
      montant_requis,
      date_debut,
      date_fin,
      statut,
      niveauRisque,
      expectedReturn,
    } = req.body;

    projetExist.titre = titre || projetExist.titre;
    projetExist.description = description || projetExist.description;
    projetExist.categorie = categorie || projetExist.categorie;
    projetExist.montant_requis = montant_requis || projetExist.montant_requis;
    projetExist.date_debut = date_debut || projetExist.date_debut;
    projetExist.date_fin = date_fin || projetExist.date_fin;
    projetExist.statut = statut || projetExist.statut;
    projetExist.niveauRisque = niveauRisque || projetExist.niveauRisque;
    projetExist.expectedReturn = expectedReturn || projetExist.expectedReturn;

    await projetExist.save();

    res.status(200).json(projetExist);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la modification du projet.",
      error: error.message || error,
    });
  }
};

projetController.supprimerProjet = async (req, res) => {
  try {
    const porteurId = req.user.userId; // ID extrait du token
    const projetId = req.params.id;
    console.log("ID du projet:", projetId); // Ajouter un log pour voir l'ID reçu

    const projet = await Projet.findById(projetId);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    if (projet.porteur.toString() !== porteurId) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce projet." });
    }

    await Projet.findByIdAndDelete(projetId);

    res.status(200).json({ message: "Projet supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la suppression du projet.",
      error: error.message || error,
    });
  }
};

projetController.getProjetsUtilisateur = async (req, res) => {
  try {
    const porteurId = req.user.userId;

    const projets = await Projet.find({ porteur: porteurId });

    if (projets.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun projet trouvé pour cet utilisateur." });
    }

    res.status(200).json(projets);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des projets.",
      error: error.message || error,
    });
  }
};

projetController.getAllProjets = async (req, res) => {
  try {
    const { search, categorie, niveauRisque } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (categorie) {
      filter.categorie = categorie;
    }

    if (niveauRisque) {
      filter.niveauRisque = niveauRisque;
    }

    const projets = await Projet.find(filter).populate("porteur", "nom prenom");

    // Calculate days left and add it to each project
    const projetsWithDetails = projets.map((projet) => {
      const projetObj = projet.toObject();

      // Calculate days left
      if (projet.date_fin) {
        const today = new Date();
        const endDate = new Date(projet.date_fin);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        projetObj.daysLeft = daysLeft;
      }

      return projetObj;
    });

    res.status(200).json(projetsWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération de tous les projets.",
      error: error.message || error,
    });
  }
};

projetController.accepterProjet = async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    projet.statut = "validé";
    await projet.save();

    res.status(200).json({ message: "Projet accepté avec succès.", projet });
  } catch (err) {
    console.error("Erreur lors de l'acceptation du projet :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

projetController.refuserProjet = async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    projet.statut = "annulé";
    await projet.save();

    res.status(200).json({ message: "Projet refusé avec succès.", projet });
  } catch (err) {
    console.error("Erreur lors du refus du projet :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

projetController.getProjetById = async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id).populate(
      "porteur",
      "nom prenom"
    );

    if (!projet) {
      return res.status(404).json({ message: "Projet non trouvé." });
    }

    res.status(200).json(projet);
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

projetController.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Projet.countDocuments();
    const validatedProjects = await Projet.countDocuments({ statut: "validé" });
    const pendingProjects = await Projet.countDocuments({
      statut: "en attente",
    });
    const canceledProjects = await Projet.countDocuments({ statut: "annulé" });

    const stats = {
      total: totalProjects,
      validated: validatedProjects,
      pending: pendingProjects,
      canceled: canceledProjects,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = projetController;
