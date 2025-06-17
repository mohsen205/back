const mongoose = require("mongoose");

const projetSchema = new mongoose.Schema({
  numProjet: {
    type: String,
    unique: true,
    required: true,
  },
  titre: String,
  description: String,
  categorie: String,
  montant_requis: Number,
  montant_collecté: { type: Number, default: 0 },
  date_debut: Date,
  date_fin: Date,
  niveauRisque: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  expectedReturn: {
    type: Number,
    default: 0,
  },
  statut: {
    type: String,
    enum: ["en_attente", "validé", "en_cours", "terminé", "annulé"],
    default: "en_attente",
  },
  porteur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Projet", projetSchema);
