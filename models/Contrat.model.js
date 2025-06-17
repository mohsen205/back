const mongoose = require("mongoose");

const contratSchema = new mongoose.Schema(
  {
    objet: { type: String, required: true },
    montant: { type: Number },
    direction: { type: String },
    dateSignature: { type: Date },
    dateEffet: { type: Date },
    duree: { type: String },
    dateFin: { type: Date },
    datePreavis: { type: Date },
    fichier: { type: String, default: null },
    projet: [{ type: mongoose.Schema.Types.ObjectId, ref: "Projet" }],
    etat: {
      type: String,
      enum: ["en attente", "accepté", "refusé"],
      default: "en attente",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contrat", contratSchema);
