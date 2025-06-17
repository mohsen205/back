const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  montant: { type: Number, required: true },
  type: {
    type: String,
    enum: ["investissement", "rendement"],
    required: true,
  },
  statut: {
    type: String,
    enum: ["complete", "en_cours", "annule"],
    required: true,
    default: "en_cours",
  },
});

const investmentSchema = new mongoose.Schema(
  {
    projet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Projet",
      required: true,
    },
    investisseur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    montant_investi: {
      type: Number,
      required: true,
    },
    date_investissement: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ["actif", "termine", "annule"],
      default: "actif",
    },
    rendement_attendu: {
      type: Number,
    },
    date_retour_attendu: {
      type: Date,
    },
    documents: {
      contrat: String,
      recu: String,
    },
    commentaires: String,
    historique_paiements: [paiementSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Investment", investmentSchema);
