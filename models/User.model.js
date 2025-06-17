const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  typeUtilisateur: {
    type: String,
    enum: ['investisseur', 'porteurprojet'],
    required: true
  },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adresse: { type: String, required: true },
  phone: { type: Number, required: true },
  imageprofile: { type: String },
  role: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
  isActive: { type: Boolean, default: false },
  dateCreation: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  contrats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contrat' }] 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
